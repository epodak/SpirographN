// UI模块
var sgnUI = function (settings) {
    'use strict';

    return {
        initUI: initUI,
        toggleSidebar: toggleSidebar,
        setValues: setValues,
        loadValues: loadValues,
        addRotor: addRotor,
        updateURL: updateURL,
        colorInputOK: colorInputOK,
        presetEvent: presetEvent,
        inputEvent: inputEvent
    };

    function initUI(sidebarId, canvasDivId) {
        // 保存DOM引用
        settings.sidebarDiv = document.getElementById(sidebarId);
        settings.divCanvas = document.getElementById(canvasDivId);

        // 设置类名
        settings.sidebarDiv.className = "sidebar";
        settings.divCanvas.className = "pad";

        // 保存ID
        settings.idNames.sidebar = sidebarId;
        settings.idNames.pad = canvasDivId;

        // 创建UI元素
        createPresetSelector();
        createStatorInput();
        createRotorControls();
        createPenControls();
        createDrawingControls();
        createToolButtons();

        // 设置窗口调整大小事件
        window.onresize = function (e) {
            if (typeof sgnDrawing !== 'undefined' && sgnDrawing.resizeCanvas) {
                sgnDrawing(settings).resizeCanvas(e);
            }
        };

        // 设置初始转子列表高度
        var rotorsDiv = document.getElementById(settings.idNames.rotors);
        if (rotorsDiv) {
            rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
        }
    }

    function toggleSidebar() {
        var sidebar = settings.sidebarDiv;
        var toggleBtn = document.querySelector('.sidebar-toggle');

        if (sidebar.classList.contains('sidebar-collapsed')) {
            // 展开侧边栏
            sidebar.classList.remove('sidebar-collapsed');
            sidebar.classList.add('sidebar-expanded');
            toggleBtn.classList.remove('toggle-collapsed');
            toggleBtn.innerHTML = "◀";
            toggleBtn.setAttribute("title", "隐藏侧边栏");
        } else {
            // 收起侧边栏
            sidebar.classList.remove('sidebar-expanded');
            sidebar.classList.add('sidebar-collapsed');
            toggleBtn.classList.add('toggle-collapsed');
            toggleBtn.innerHTML = "▶";
            toggleBtn.setAttribute("title", "显示侧边栏");
        }

        // 重新调整画布大小
        setTimeout(function () {
            if (typeof sgnDrawing !== 'undefined' && sgnDrawing.resizeCanvas) {
                sgnDrawing(settings).resizeCanvas();
            }
        }, 300);
    }

    function createPresetSelector() {
        var select = document.createElement("SELECT");
        select.id = settings.idNames.presets;
        settings.sidebarDiv.appendChild(select);

        // 添加预设选项
        for (var i = 0; i < settings.presets.length; i++) {
            var option = document.createElement("OPTION");
            option.value = settings.presets[i].name;
            option.text = settings.presets[i].name;
            select.appendChild(option);
        }

        // 添加事件监听
        select.addEventListener("change", function (event) {
            var val = this.value;
            for (var c in settings.presets) {
                if (settings.presets[c].name === val) {
                    loadValues(settings.presets[c]);
                }
            }
            document.getElementById(settings.idNames.stator).focus();
            var rotorsDiv = document.getElementById(settings.idNames.rotors);
            if (rotorsDiv) {
                rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
            }
        });
    }

    function createStatorInput() {
        var div = document.createElement("DIV");
        div.className = "inputGroup";
        settings.sidebarDiv.appendChild(div);

        var label = document.createElement("SPAN");
        label.className = "letterLabel";
        label.innerHTML = "stator";
        div.appendChild(label);

        var input = document.createElement("INPUT");
        input.className = "number";
        input.setAttribute("type", "text");
        input.setAttribute("id", settings.idNames.stator);
        div.appendChild(input);

        // 添加事件监听
        input.addEventListener("input", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });
    }

    function createRotorControls() {
        var div = document.createElement("DIV");
        div.id = settings.idNames.rotors;
        settings.sidebarDiv.appendChild(div);

        // 添加按钮
        var addButton = document.createElement("BUTTON");
        addButton.id = settings.idNames.add;
        addButton.innerHTML = "添加转子";
        settings.sidebarDiv.appendChild(addButton);

        addButton.addEventListener("click", function () {
            // 添加转子的逻辑
            settings.numRotors++;
            addRotor(settings.numRotors, "75", "h");
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });
    }

    function createPenControls() {
        var div = document.createElement("DIV");
        div.className = "inputGroup";
        settings.sidebarDiv.appendChild(div);

        // 笔半径
        var label = document.createElement("SPAN");
        label.className = "letterLabel";
        label.innerHTML = "pen";
        div.appendChild(label);

        var input = document.createElement("INPUT");
        input.className = "number";
        input.setAttribute("type", "text");
        input.setAttribute("id", settings.idNames.pen);
        div.appendChild(input);

        // 线宽
        div = document.createElement("DIV");
        div.className = "inputGroup";
        settings.sidebarDiv.appendChild(div);

        label = document.createElement("SPAN");
        label.className = "letterLabel";
        label.innerHTML = "width";
        div.appendChild(label);

        input = document.createElement("INPUT");
        input.className = "number";
        input.setAttribute("type", "text");
        input.setAttribute("id", settings.idNames.width);
        div.appendChild(input);

        // 颜色
        div = document.createElement("DIV");
        div.className = "inputGroup";
        settings.sidebarDiv.appendChild(div);

        label = document.createElement("SPAN");
        label.className = "letterLabel";
        label.innerHTML = "color";
        div.appendChild(label);

        input = document.createElement("INPUT");
        input.setAttribute("type", "color");
        input.setAttribute("id", settings.idNames.color);
        div.appendChild(input);

        // 添加事件监听
        document.getElementById(settings.idNames.pen).addEventListener("input", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });

        document.getElementById(settings.idNames.width).addEventListener("input", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });

        document.getElementById(settings.idNames.color).addEventListener("input", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });
    }

    function createDrawingControls() {
        var div = document.createElement("DIV");
        div.className = "inputGroup";
        settings.sidebarDiv.appendChild(div);

        // 速度
        var label = document.createElement("SPAN");
        label.className = "letterLabel";
        label.innerHTML = "speed";
        div.appendChild(label);

        var select = document.createElement("SELECT");
        select.id = settings.idNames.speed;
        div.appendChild(select);

        // 添加速度选项
        for (var i = 0; i < settings.speedSettings.length; i++) {
            var option = document.createElement("OPTION");
            option.value = settings.speedSettings[i].speed;
            option.text = settings.speedSettings[i].name;
            select.appendChild(option);
        }

        // 绘制按钮
        var drawButton = document.createElement("BUTTON");
        drawButton.id = settings.idNames.draw;
        drawButton.innerHTML = "绘制";
        settings.sidebarDiv.appendChild(drawButton);

        drawButton.addEventListener("click", function () {
            if (!settings.draw) {
                settings.draw = true;
                this.innerHTML = "暂停";
                settings.timer = new Date().getTime() / 1000;
                draw();
            } else {
                settings.draw = false;
                this.innerHTML = "绘制";
            }
        });

        // 清除按钮
        var clearButton = document.createElement("BUTTON");
        clearButton.id = settings.idNames.clear;
        clearButton.innerHTML = "清除";
        settings.sidebarDiv.appendChild(clearButton);

        clearButton.addEventListener("click", function () {
            clearCanvas();
        });
    }

    function createToolButtons() {
        // 重置按钮
        var resetButton = document.createElement("BUTTON");
        resetButton.id = settings.idNames.reset;
        resetButton.innerHTML = "重置";
        settings.sidebarDiv.appendChild(resetButton);

        resetButton.addEventListener("click", function () {
            reset();
        });

        // 重新开始按钮
        var restartButton = document.createElement("BUTTON");
        restartButton.id = settings.idNames.restart;
        restartButton.innerHTML = "重新开始";
        settings.sidebarDiv.appendChild(restartButton);

        restartButton.addEventListener("click", function () {
            restart();
        });

        // 缩放按钮
        var zoomInButton = document.createElement("BUTTON");
        zoomInButton.id = settings.idNames.zoomIn;
        zoomInButton.innerHTML = "放大";
        settings.sidebarDiv.appendChild(zoomInButton);

        zoomInButton.addEventListener("click", function () {
            zoom("in");
        });

        var zoomOutButton = document.createElement("BUTTON");
        zoomOutButton.id = settings.idNames.zoomOut;
        zoomOutButton.innerHTML = "缩小";
        settings.sidebarDiv.appendChild(zoomOutButton);

        zoomOutButton.addEventListener("click", function () {
            zoom("out");
        });
    }

    function addRotor(num, r, type) {
        var div = document.getElementById(settings.idNames.rotors);

        var item = document.createElement("DIV");
        item.setAttribute("id", settings.idNames.item + num);
        div.appendChild(item);

        if (num > 1) {
            var e = document.createElement("DIV");
            e.className = "divSeparator";
            item.appendChild(e);
        }

        var e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.setAttribute("style", "margin:0px");
        e.innerHTML = "r" + num;
        item.appendChild(e);

        e = document.createElement("INPUT");
        e.className = "number";
        e.setAttribute("type", "text");
        e.setAttribute("id", settings.idNames.rotor + num);
        e.setAttribute("value", r);
        item.appendChild(e);

        // 添加事件监听
        e.addEventListener("input", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });

        // 类型选择
        e = document.createElement("INPUT");
        e.setAttribute("type", "radio");
        e.setAttribute("class", "radio");
        e.setAttribute("id", settings.idNames.h + num);
        e.setAttribute("name", "type" + num);
        e.setAttribute("value", "hypotrochoid");
        if (type === "h") {
            e.setAttribute("checked", true);
        }
        item.appendChild(e);

        // 添加事件监听
        e.addEventListener("click", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "h";
        item.appendChild(e);

        e = document.createElement("INPUT");
        e.setAttribute("type", "radio");
        e.setAttribute("class", "radio");
        e.setAttribute("id", settings.idNames.e + num);
        e.setAttribute("name", "type" + num);
        e.setAttribute("value", "epitrochoid");
        if (type === "e") {
            e.setAttribute("checked", true);
        }
        item.appendChild(e);

        // 添加事件监听
        e.addEventListener("click", function (e) {
            setValues();
            if (!settings.draw) {
                drawCircles();
            }
        });

        e = document.createElement("SPAN");
        e.className = "letterLabel";
        e.innerHTML = "e";
        item.appendChild(e);
    }

    function loadValues(preset) {
        // 设置预设值到UI元素
        document.getElementById(settings.idNames.stator).value = preset.st;
        document.getElementById(settings.idNames.pen).value = preset.pen;
        document.getElementById(settings.idNames.width).value = preset.wd;
        document.getElementById(settings.idNames.color).value = preset.cl;
        document.getElementById(settings.idNames.speed).value = preset.sp;
        document.getElementById(settings.idNames.presets).value = preset.name;

        // 清除现有转子
        var rotors = document.getElementById(settings.idNames.rotors);
        while (rotors.firstChild) {
            rotors.removeChild(rotors.firstChild);
        }

        // 添加转子
        var c = 1;
        var v, r, t;
        while (preset["r" + c]) {
            v = preset["r" + c];
            r = v.substring(0, v.length - 1);
            t = v.substring(v.length - 1);
            addRotor(c, r, t);
            c++;
        }

        // 更新转子数量
        settings.numRotors = c - 1;

        // 更新设置
        setValues();

        // 如果没有在绘制，显示圆形
        if (!settings.draw) {
            settings.circles = "show";
            drawCircles();
        }
    }

    function setValues() {
        // 从UI元素读取值并更新settings
        settings.radii = [];
        settings.types = [];
        settings.directions = [];
        settings.pitches = [1];
        settings.spinPitches = [];
        settings.drawPitches = [];

        // 读取定子半径
        var stator = document.getElementById(settings.idNames.stator);
        settings.radii[0] = parseFloat(stator.value);

        // 读取笔参数
        settings.penRad = parseFloat(document.getElementById(settings.idNames.pen).value);
        settings.curveWidth = parseFloat(document.getElementById(settings.idNames.width).value);
        settings.curveColor = document.getElementById(settings.idNames.color).value;
        settings.speed = parseFloat(document.getElementById(settings.idNames.speed).value);

        // 读取转子参数
        var c = 1;
        var rotor;
        var thisHId, thisEId;

        while (document.getElementById(settings.idNames.rotor + c)) {
            rotor = document.getElementById(settings.idNames.rotor + c);
            thisHId = settings.idNames.h + c;
            thisEId = settings.idNames.e + c;

            settings.radii[c] = parseFloat(rotor.value);

            if (document.getElementById(thisHId).checked) {
                settings.types.push("h");
                if (c > 1) {
                    settings.drawPitches.push(settings.spinPitches[c - 2]);
                    settings.spinPitches.push((settings.radii[c - 1] / settings.radii[c]) - 1);
                    if (settings.types[c - 1] === "h") {
                        settings.directions.push(settings.directions[c - 1]);
                    } else {
                        settings.directions.push(settings.directions[c - 1] * -1);
                    }
                } else {
                    settings.directions = [1, 1];
                    settings.drawPitches.push(1);
                    settings.spinPitches.push((settings.radii[c - 1] / settings.radii[c]) - 1);
                }
            } else {
                settings.types.push("e");
                if (c > 1) {
                    settings.drawPitches.push(settings.spinPitches[c - 2]);
                    settings.spinPitches.push((settings.radii[c - 1] / settings.radii[c]) + 1);
                    if (settings.types[c - 1] === "h") {
                        settings.directions.push(settings.directions[c - 1]);
                    } else {
                        settings.directions.push(settings.directions[c - 1] * -1);
                    }
                } else {
                    settings.directions = [1, 1];
                    settings.drawPitches.push(1);
                    settings.spinPitches.push((settings.radii[c - 1] / settings.radii[c]) + 1);
                }
            }
            c++;
        }
        settings.numRotors = c - 1;

        // 创建URL字符串
        updateURL();
    }

    function updateURL() {
        var u = window.location.origin + window.location.pathname;
        for (var c in settings.radii) {
            if (c == 0) {
                u += "?st=" + settings.radii[c];
            } else {
                u += "&r" + c + "=" + settings.radii[c] + settings.types[c - 1];
            }
        }
        u += "&pen=" + settings.penRad;
        u += "&wd=" + settings.curveWidth;
        u += "&cl=" + settings.curveColor.substring(1);
        u += "&sp=" + settings.speed;
        settings.url = u;
    }

    function colorInputOK() {
        // 检查浏览器是否支持颜色输入
        var input = document.createElement("input");
        input.setAttribute("type", "color");
        return input.type === "color";
    }

    function presetEvent(id, event) {
        document.getElementById(id).addEventListener(event, function () {
            var val = this.value;
            for (var c in settings.presets) {
                if (settings.presets[c].name === val) {
                    loadValues(settings.presets[c]);
                }
            }
            document.getElementById(settings.idNames.stator).focus();
            var rotorsDiv = document.getElementById(settings.idNames.rotors);
            if (rotorsDiv) {
                rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
            }
        });
    }

    function inputEvent(id, event) {
        document.getElementById(id).addEventListener(event, function () {
            setValues();
            if (!settings.draw && typeof drawCircles === 'function') {
                drawCircles();
            }
        });
    }
}
