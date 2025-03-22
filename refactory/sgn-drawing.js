// 绘图模块
var sgnDrawing = function (settings) {
    'use strict';

    return {
        setupCanvas: setupCanvas,
        drawCircles: drawCircles,
        drawCurve: drawCurve,
        draw: draw,
        clearCanvas: clearCanvas,
        restart: restart,
        reset: reset,
        rotateDrawing: rotateDrawing,
        zoom: zoom,
        resizeCanvas: resizeCanvas // 添加这个函数到返回对象
    };

    function setupCanvas() {
        //create canvas elements then call resize routine
        settings.canvasCircles = document.createElement("canvas");
        settings.canvasCircles.id = settings.idNames.canvasCircles;
        settings.canvasPen = document.createElement("canvas");
        settings.canvasPen.id = settings.idNames.canvasPen;
        settings.divCanvas.appendChild(settings.canvasCircles);
        settings.divCanvas.appendChild(settings.canvasPen);
        resizeCanvas();
    }

    function resizeCanvas() {
        var offscreen = 100;

        //capture current draw state and pause drawing.
        var drawing = settings.draw;
        settings.draw = false;

        //we need to capture the current drawing and redraw when set
        var ctx = settings.canvasPen.getContext("2d");
        var ctxCircles = settings.canvasCircles.getContext("2d");
        var cd = ctx.getImageData(0, 0, settings.canvasCircles.width, settings.canvasCircles.height);

        ctx.save();
        ctxCircles.save();

        //fill window
        settings.windowWidth = window.innerWidth;
        settings.windowHeight = window.innerHeight;
        settings.divCanvasWidth = 98.5;
        settings.divCanvasHeight = settings.windowHeight - 28;
        settings.sidebarWidth = settings.sidebarDiv.clientWidth;

        //set sidebar and pad sizes and store in settings
        settings.divCanvas.setAttribute("style", "width:" + settings.divCanvasWidth + "%;height:" + settings.divCanvasHeight + "px;background:white");
        settings.sidebarDiv.setAttribute("style", "min-height:" + settings.divCanvasHeight + "px;");
        settings.left = settings.divCanvas.offsetLeft + settings.sidebarWidth - offscreen;
        settings.top = settings.divCanvas.offsetTop - offscreen;

        //set rotor list height
        var rotors = document.getElementById(settings.idNames.rotors);
        rotors.setAttribute("style", "max-height:" + settings.divCanvasHeight * .23 + "px;");

        //if we're resizing and we have a previous poisition, then track the offset, so we can redraw our canvases in position
        //round the coordinates for the center, otherwise the redraws are off.
        if (settings.a) {
            settings.offsetL = (Math.round((settings.divCanvas.clientWidth - settings.sidebarWidth) / 2)) + offscreen - settings.a;
            settings.offsetT = Math.round((settings.divCanvasHeight / 2)) + offscreen - settings.b;
        }

        //now recenter
        settings.a = Math.round(((settings.divCanvas.clientWidth - settings.sidebarWidth) / 2)) + offscreen;
        settings.b = Math.round((settings.divCanvasHeight / 2)) + offscreen;

        //resize canvases
        settings.canvasCircles.height = settings.divCanvasHeight + offscreen * 2;
        settings.canvasCircles.width = settings.divCanvas.clientWidth - settings.sidebarWidth + offscreen * 2;
        settings.canvasCircles.setAttribute("Style", "left:" + settings.left + "px;top:" + settings.top + "px;position:absolute;z-index:10");
        settings.canvasPen.height = settings.divCanvasHeight + offscreen * 2;
        settings.canvasPen.width = settings.divCanvas.clientWidth - settings.sidebarWidth + offscreen * 2;
        settings.canvasPen.setAttribute("Style", "left:" + settings.left + "px;top:" + settings.top + "px;position:absolute;z-index:20");
        // 确保canvas不会超出容器
        settings.canvasCircles.style.maxWidth = "100%";
        settings.canvasCircles.style.maxHeight = "100%";
        settings.canvasPen.style.maxWidth = "100%";
        settings.canvasPen.style.maxHeight = "100%";

        //update coordinates based on new position
        if (settings.penStart.x != 0) {
            settings.penStart.x = settings.penStart.x + settings.offsetL;
            settings.penStart.y = settings.penStart.y + settings.offsetT;
            settings.curvePoints[0].x = settings.curvePoints[0].x + settings.offsetL;
            settings.curvePoints[0].y = settings.curvePoints[0].y + settings.offsetT;
        }

        //restore rotation
        if (settings.iPosition != 0) {
            var posHolder = settings.iPosition;
            var offSetHolder = settings.iOffset;
            settings.iOffset = settings.iPosition * -1;
            rotateDrawing();
            settings.iOffset = offSetHolder;
            settings.iPosition = posHolder;
        }

        //redraw circles
        if (!settings.draw) {
            drawCircles();
        }

        //redraw canvas
        ctx.putImageData(cd, settings.offsetL, settings.offsetT);

        //restore drawing state
        settings.draw = drawing;
    }

    function circlePoint(a, b, r, ng) {
        var rad = ng * (Math.PI / 180);
        var y = r * Math.sin(rad);
        var x = r * Math.cos(rad);
        x = a + x;
        y = b - y;
        return {
            "x": x,
            "y": y
        }
    }

    function drawCircles() {
        var c = 1;
        var i = settings.i;

        var thisRad = 0;
        var prevRad = 0;
        var centerRad = 0;
        var thisPitch = 0;
        var prevPitch = 0;
        var prevSpinPitch = 0;
        var prevDrawPitch = 0;
        var pen;

        var zoom = settings.currentZoom;

        //clear circles canvas
        var ctx = settings.canvasCircles.getContext("2d");
        ctx.clearRect(0, 0, settings.canvasCircles.width, settings.canvasCircles.height);

        //draw Stator
        if (settings.circles === "show") {
            drawOneCircle(settings.canvasCircles, settings.a, settings.b, settings.radii[0] * zoom);
        }

        //start at the center
        var pt = {
            "x": settings.a,
            "y": settings.b,
        };

        c = 1;
        //draw rotor Circles
        while (c < (settings.radii.length)) {
            //set radii, applying zoom
            thisRad = Number(settings.radii[c]) * zoom;
            prevRad = Number(settings.radii[c - 1]) * zoom;
            if (settings.types[c] === "h") {
                //hypitrochoid: circle inside
                centerRad = prevRad - thisRad;
            } else {
                //eptrochoid: circle outside
                centerRad = prevRad + thisRad;
            }

            //pitches are cumulative, so extract previous from array.
            if (c > 1) {
                prevPitch = prevPitch + settings.pitches[c - 2];
                prevSpinPitch = prevSpinPitch + settings.spinPitches[c - 2];
                prevDrawPitch = prevDrawPitch + settings.drawPitches[c - 2];
            } else {
                prevPitch = 0;
                prevSpinPitch = 0;
                prevDrawPitch = 0;
            }

            //set travel direction
            var mult = settings.directions[c];

            //set draw pitch
            var thisPitch = (settings.drawPitches[c - 1] + prevDrawPitch) * mult;

            //set pen pitch
            //physics here is subjective
            var os = (c > 1) ? 1 : 0;
            if (settings.types[c] === "h") {
                var penPitch = (settings.spinPitches[c - 1] + prevSpinPitch) * mult * -1;
            } else {
                var penPitch = (settings.spinPitches[c - 1] + prevSpinPitch) * mult;
            }

            //draw this rotor
            var pt = circlePoint(pt.x, pt.y, centerRad, i * thisPitch);
            if (settings.circles === "show") {
                drawOneCircle(settings.canvasCircles, pt.x, pt.y, thisRad);
            }

            //draw Pen
            //pen pitch set in last circle iteration
            var penPt = circlePoint(pt.x, pt.y, thisRad, i * penPitch);
            if (settings.circles === "show") {
                var ctx = settings.canvasCircles.getContext("2d");
                ctx.lineWidth = .3;
                ctx.lineStyle = settings.circleColor;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(penPt.x, penPt.y);
                ctx.stroke();
                ctx.closePath();
            }
            c++;
        }

        //draw Pen
        //pen pitch set in last circle iteration
        var penPt = circlePoint(pt.x, pt.y, settings.penRad * zoom, i * penPitch);

        //mark our starting point
        if (settings.i === 0) {
            settings.penStart = penPt;
        }

        //line from center to pen
        if (settings.circles === "show") {
            var ctx = settings.canvasCircles.getContext("2d");
            ctx.lineWidth = .2;
            ctx.lineStyle = settings.circleColor;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(penPt.x, penPt.y);
            ctx.stroke();
            ctx.closePath();

            //circle for pen Point
            drawOneCircle(settings.canvasCircles, penPt.x, penPt.y, 1, true);
        }

        //update curve points for drawCurve()
        //only maintain previous point, so we'll always plot previous to current.
        settings.curvePoints.push(penPt);
        if (settings.curvePoints.length > 2) {
            settings.curvePoints.shift();
        }
    }

    function drawOneCircle(canvas, a, b, r, fill) {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(a, b, r, 0, 2 * Math.PI);
        var currentColor = ctx.strokeStyle;
        var currentWidth = ctx.lineWidth;
        ctx.strokeStyle = settings.circleColor;
        ctx.lineWidth = settings.circleStroke;
        if (fill) {
            ctx.fillStyle = settings.curveColor;
            ctx.fill();
            ctx.strokeStyle = settings.curveColor;
        }
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = currentColor;
        ctx.strokeStyle = currentWidth;
    }

    function drawCurve() {
        var ctx = settings.canvasPen.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = settings.curveColor;
        ctx.lineWidth = parseFloat(settings.curveWidth) + 0.001;
        ctx.moveTo(settings.curvePoints[0].x, settings.curvePoints[0].y);
        ctx.lineTo(settings.curvePoints[1].x, settings.curvePoints[1].y);
        ctx.stroke();
        ctx.closePath();
    }

    function draw() {
        //if we've cycled back to the beginning, then pause
        if (
            settings.curvePoints[1] && settings.draw && settings.i > settings.iterator &&
            settings.curvePoints[1].x === settings.penStart.x &&
            settings.curvePoints[1].y.toFixed(1) === settings.penStart.y.toFixed(1)
        ) {
            var nd = new Date().getTime() / 1000;
            settings.timer = nd - settings.timer;
            var button = document.getElementById(settings.idNames.draw);
            settings.draw = false;
            button.innerHTML = "draw";
            settings.i = 0;
            if (settings.circleReset) {
                settings.circles = "show";
                settings.circleReset = false;
            }
            drawCircles();
            return;
        }

        //button has been toggled
        if (!settings.draw) {
            if (settings.circleReset) {
                settings.circles = "show";
                settings.circleReset = false;
            }
            drawCircles();
            return;
        }

        var c = 0;
        var stu;

        //adjust speed so 1 iteration per frame is the smallest we use
        //if decimal is specified we add a timeout to the frame below.
        if (settings.speed < 1) {
            stu = 1
        } else {
            stu = settings.speed;
        }

        //hide circles if we're going too fast
        if (settings.speed > 50 && settings.circles === "show") {
            settings.circles = "hide";
            settings.circleReset = true;
        } else if (settings.speed <= 50 && settings.circleReset && settings.circles === "hide") {
            //we've slowed down, so we can show again
            settings.circles = "show";
            settings.circleReset = false;
        }

        //run circles off for internal loop
        if (settings.circles === "show") {
            settings.circles = "hide";
            var circles = true;
        }

        //flag that a drawing exists in settings
        //hard to detect if drawing is present on canvas otherwise.
        settings.drawing = true;

        //loop through the speed iterations without a frame
        //this should run at least once
        while (c < stu) {
            //if we've cycled back to the beginning, then pause
            if (
                settings.curvePoints[1] && settings.draw && settings.i > settings.iterator &&
                settings.curvePoints[1].x === settings.penStart.x &&
                settings.curvePoints[1].y.toFixed(1) === settings.penStart.y.toFixed(1)
            ) {
                var nd = new Date().getTime() / 1000;
                settings.timer = nd - settings.timer;
                var button = document.getElementById(settings.idNames.draw);
                settings.draw = false;
                button.innerHTML = "draw";
                settings.i = 0;
                if (settings.circleReset) {
                    settings.circles = "show";
                    settings.circleReset = false;
                }
                break;
            }
            if (!settings.draw) {
                if (settings.circleReset) {
                    settings.circles = "show";
                    settings.circleReset = false;
                }
                break;
            }

            if (circles) {
                settings.circles = "show";
            }

            drawCircles();
            drawCurve();
            //if we've done 1000 iterations, then call frame here, so there's some initial feedback
            settings.i = settings.i + settings.iterator;
            c = c + settings.iterator;
        }

        //draw
        drawCircles();
        drawCurve();

        //if we're decimal on speed then create timeout
        if (settings.speed < 1) {
            setTimeout(draw, 10 / settings.speed);
        } else {
            //or just request frame
            requestAnimationFrame(draw);
        }
    }

    function clearCanvas() {
        //if we're zoomed out then clear the zoom to clear bigger drawings
        if (settings.zoomStack[0] < 1) {
            zoomTempClear()
            var z = true;
        }

        //clear
        var ctx = settings.canvasPen.getContext("2d");
        ctx.clearRect(0, 0, settings.canvasPen.width, settings.canvasPen.height);

        //restore Zoom
        if (z) {
            zoomTempRestore()
        }
        settings.drawing = false;
    }

    function zoomTempClear() {
        // 临时保存当前缩放状态，并重置为1
        settings.zoomTemp = settings.currentZoom;
        settings.currentZoom = 1;
        drawCircles();
    }

    function zoomTempRestore() {
        // 恢复之前保存的缩放状态
        settings.currentZoom = settings.zoomTemp;
        drawCircles();
    }

    function restart() {
        settings.i = 0;
        // 注意：原始代码中调用了setValues()函数，这个函数应该在UI模块中
        // 在这里我们只需要重置i值并重绘圆形
        drawCircles();
    }

    function reset() {
        settings.i = 0;
        clearCanvas();
        if (settings.iPosition !== 0) {
            //set rotation position to 0
            var temp = settings.iOffset;
            settings.iOffset = settings.iPosition;
            rotateDrawing();
            settings.iOffset = temp;
            settings.iPosition = 0;
        }
        //reset zoom
        settings.zoomStack = [1];
        settings.currentZoom = 1;
        drawCircles();
    }

    function rotateDrawing() {

        var degrees = settings.iOffset * -1;
        settings.iPosition += degrees;

        var ctx = settings.canvasCircles.getContext("2d");
        var ctxPen = settings.canvasPen.getContext("2d");

        //angle from center to upper left, we're going to translate this point
        var ang = ((Math.PI / 180) * 180) - Math.atan((settings.canvasPen.clientHeight / 2) / (settings.canvasPen.clientWidth / 2));

        var ang = ang - (degrees * (Math.PI / 180));

        var hyp = Math.sqrt(Math.pow(settings.canvasPen.clientHeight / 2, 2) + Math.pow(settings.canvasPen.clientWidth / 2, 2));

        var pt = circlePoint(settings.a, settings.b, hyp, ang / (Math.PI / 180));

        //rotate pen Canvas
        //ctxPen.save();
        ctxPen.translate(pt.x, pt.y);
        ctxPen.rotate(degrees * (Math.PI / 180));

        ctx.translate(pt.x, pt.y);
        ctx.rotate(degrees * (Math.PI / 180));

        //draw image from circles and restore
        //ctxPen.drawImage(settings.canvasCircles,0, 0);
        //ctxPen.restore();

        drawCircles();
    }

    function zoom(inOut) {

        if (settings.zoomStack.length > 1 && inOut === "in" && settings.zoomStack[0] < 1) {
            //we're changing directions from going out to in
            var removed = settings.zoomStack.shift();
        }
        else if (settings.zoomStack.length > 1 && inOut === "out" && settings.zoomStack[0] > 1) {
            //we're changing directions from going in to out
            var removed = settings.zoomStack.shift();
        }
        else if (inOut === "in") {
            //same direction or first move
            settings.zoomStack.unshift(1 + settings.zoom);
        }
        else if (inOut === "out") {
            //same direction or first move
            settings.zoomStack.unshift(1 - settings.zoom);
        }
        else {
            return;
        }

        settings.currentZoom = Math.pow(settings.zoomStack[0], settings.zoomStack.length - 1);

        drawCircles();
    }
