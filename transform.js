module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // 1. 提取全局设置对象
    const settingsObject = root.find(j.ObjectExpression).at(-1).get();

    // 2. 创建 sgn-core.js
    const coreContent = `
// 全局设置对象
var sgnSettings = ${j(settingsObject).toSource()};

// 主模块
var sgn = (function () {
    'use strict';

    // 导入其他模块
    var ui = sgnUI(sgnSettings);
    var drawing = sgnDrawing(sgnSettings);
    var presets = sgnPresets;

    // 将预设数据添加到设置中
    sgnSettings.presets = presets.presets;
    sgnSettings.penColors = presets.penColors;
    sgnSettings.speedSettings = presets.speedSettings;

    return {
        load: function(sidebarId, canvasDivId) {
            ui.initUI(sidebarId, canvasDivId);
            drawing.setupCanvas();
        },
        spot: function(d) {
            // 实现spot函数
            ${root.find(j.FunctionDeclaration, { id: { name: 'spot' } })
            .get().value.body.source()}
        }
    };
})();
`;

    // 3. 创建 sgn-ui.js
    const uiFunctions = [
        'toggleSidebar',
        'addButton',
        'deleteButton',
        'makeButton',
        'makeImage',
        'makeSpan',
        'drawButton',
        'clearButton',
        'restartButton',
        'hideButton',
        'openImageButton',
        'settingsURLButton',
        'zoomInButton',
        'zoomOutButton',
        'rotateButton',
        'resetButton',
        'gitButton',
        'loadValues',
        'addRotor',
        'setValues',
        'colorInputOK',
        'inputEvent',
        'presetEvent'
    ];

    const uiContent = `
var sgnUI = function(settings) {
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

    ${uiFunctions.map(fname =>
        root.find(j.FunctionDeclaration, { id: { name: fname } })
            .get().value.source()
    ).join('\n\n')}
}`;

    // 4. 创建 sgn-drawing.js
    const drawingFunctions = [
        'drawCanvas',
        'resizeCanvas',
        'circlePoint',
        'drawCircles',
        'drawOneCircle',
        'drawCurve',
        'draw',
        'clearCanvas',
        'restart',
        'reset',
        'rotateDrawing',
        'zoom'
    ];

    const drawingContent = `
var sgnDrawing = function(settings) {
    'use strict';

    var canvas = sgnCanvas(settings);
    var transform = sgnTransform(settings);

    return {
        setupCanvas: canvas.setup,
        drawCircles: canvas.drawCircles,
        drawCurve: canvas.drawCurve,
        draw: draw,
        clearCanvas: canvas.clear,
        restart: restart,
        reset: reset,
        rotateDrawing: transform.rotate,
        zoom: transform.zoom,
        resizeCanvas: canvas.resize
    };

    ${drawingFunctions.map(fname =>
        root.find(j.FunctionDeclaration, { id: { name: fname } })
            .get().value.source()
    ).join('\n\n')}
}`;

    // 5. 创建 sgn-canvas.js
    const canvasContent = `
var sgnCanvas = function(settings) {
    'use strict';

    return {
        setup: setup,
        resize: resize,
        drawCircles: drawCircles,
        drawOneCircle: drawOneCircle,
        drawCurve: drawCurve,
        clear: clear
    };

    function setup() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'drawCanvas' } })
            .get().value.body.source()}
    }

    function resize() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'resizeCanvas' } })
            .get().value.body.source()}
    }

    function drawCircles() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'drawCircles' } })
            .get().value.body.source()}
    }

    function drawOneCircle(canvas, a, b, r, fill) {
        ${root.find(j.FunctionDeclaration, { id: { name: 'drawOneCircle' } })
            .get().value.body.source()}
    }

    function drawCurve() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'drawCurve' } })
            .get().value.body.source()}
    }

    function clear() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'clearCanvas' } })
            .get().value.body.source()}
    }
}`;

    // 6. 创建 sgn-transform.js
    const transformContent = `
var sgnTransform = function(settings) {
    'use strict';

    return {
        circlePoint: circlePoint,
        rotate: rotate,
        zoom: zoom
    };

    function circlePoint(a, b, r, ng) {
        ${root.find(j.FunctionDeclaration, { id: { name: 'circlePoint' } })
            .get().value.body.source()}
    }

    function rotate() {
        ${root.find(j.FunctionDeclaration, { id: { name: 'rotateDrawing' } })
            .get().value.body.source()}
    }

    function zoom(inOut) {
        ${root.find(j.FunctionDeclaration, { id: { name: 'zoom' } })
            .get().value.body.source()}
    }
}`;

    // 7. 创建 sgn-presets.js
    const presetsContent = `
var sgnPresets = {
    presets: ${j(settingsObject.value.properties.find(p => p.key.name === 'presets').value).toSource()},
    penColors: ${j(settingsObject.value.properties.find(p => p.key.name === 'penColors').value).toSource()},
    speedSettings: ${j(settingsObject.value.properties.find(p => p.key.name === 'speedSettings').value).toSource()}
};`;

    // 8. 创建 sgn-main.js
    const mainContent = `
(function() {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化应用程序
        sgn.load('sidebar', 'pad');
    });

    // 添加窗口加载事件
    window.addEventListener('load', function() {
        // 处理URL参数
        var parms = location.search.substring(1).split("&");
        if (parms[0]) {
            var d = {};
            for (var c in parms) {
                var a = parms[c].split("=");
                d[a[0]] = decodeURIComponent(a[1]);
            }
            // ... 处理参数
        }
    });
})();`;

    // 写入文件
    require('fs').writeFileSync('sgn-core.js', coreContent);
    require('fs').writeFileSync('sgn-ui.js', uiContent);
    require('fs').writeFileSync('sgn-drawing.js', drawingContent);
    require('fs').writeFileSync('sgn-canvas.js', canvasContent);
    require('fs').writeFileSync('sgn-transform.js', transformContent);
    require('fs').writeFileSync('sgn-presets.js', presetsContent);
    require('fs').writeFileSync('sgn-main.js', mainContent);

    return root.toSource();
};
