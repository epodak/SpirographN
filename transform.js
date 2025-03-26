module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // 1. 提取全局设置对象
    const settingsObject = root.find(j.ObjectExpression).at(-1).get();

    // 2. 获取spot函数的内容
    const spotFunc = root.find(j.FunctionDeclaration, { id: { name: 'spot' } }).get();
    const spotFuncBody = spotFunc ? j(spotFunc.value.body).toSource() : '{}';

    // 创建 sgn-core.js
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
            ${spotFuncBody}
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

    const uiFunctionsCode = uiFunctions.map(fname => {
        const func = root.find(j.FunctionDeclaration, { id: { name: fname } });
        return func.size() > 0 ? j(func.get()).toSource() : `function ${fname}() { /* 未找到函数实现 */ }`;
    }).join('\n\n');

    const uiContent = `
var sgnUI = function(settings) {
    'use strict';

    // 添加initUI函数实现
    function initUI(sidebarId, canvasDivId) {
        // 这里需要实现UI初始化逻辑
        // 基于load函数的内容
        const loadFunc = root.find(j.FunctionDeclaration, { id: { name: 'load' } }).get();
        if (loadFunc) {
            ${j(root.find(j.FunctionDeclaration, { id: { name: 'load' } }).get().value.body).toSource()}
        }
    }

    function updateURL() {
        // URL更新逻辑
    }

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

    ${uiFunctionsCode}
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

    const drawingFunctionsCode = drawingFunctions.map(fname => {
        const func = root.find(j.FunctionDeclaration, { id: { name: fname } });
        return func.size() > 0 ? j(func.get()).toSource() : `function ${fname}() { /* 未找到函数实现 */ }`;
    }).join('\n\n');

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

    ${drawingFunctionsCode}
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
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'drawCanvas' } }).size() > 0
        ? root.find(j.FunctionDeclaration, { id: { name: 'drawCanvas' } }).get().value.body
        : j.blockStatement([])).toSource()}
    }

    function resize() {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'resizeCanvas' } }).size() > 0
            ? root.find(j.FunctionDeclaration, { id: { name: 'resizeCanvas' } }).get().value.body
            : j.blockStatement([])).toSource()}
    }

    function drawCircles() {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'drawCircles' } }).size() > 0
                ? root.find(j.FunctionDeclaration, { id: { name: 'drawCircles' } }).get().value.body
                : j.blockStatement([])).toSource()}
    }

    function drawOneCircle(canvas, a, b, r, fill) {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'drawOneCircle' } }).size() > 0
                    ? root.find(j.FunctionDeclaration, { id: { name: 'drawOneCircle' } }).get().value.body
                    : j.blockStatement([])).toSource()}
    }

    function drawCurve() {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'drawCurve' } }).size() > 0
                        ? root.find(j.FunctionDeclaration, { id: { name: 'drawCurve' } }).get().value.body
                        : j.blockStatement([])).toSource()}
    }

    function clear() {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'clearCanvas' } }).size() > 0
                            ? root.find(j.FunctionDeclaration, { id: { name: 'clearCanvas' } }).get().value.body
                            : j.blockStatement([])).toSource()}
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
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'circlePoint' } }).size() > 0
        ? root.find(j.FunctionDeclaration, { id: { name: 'circlePoint' } }).get().value.body
        : j.blockStatement([])).toSource()}
    }

    function rotate() {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'rotateDrawing' } }).size() > 0
            ? root.find(j.FunctionDeclaration, { id: { name: 'rotateDrawing' } }).get().value.body
            : j.blockStatement([])).toSource()}
    }

    function zoom(inOut) {
        ${j(root.find(j.FunctionDeclaration, { id: { name: 'zoom' } }).size() > 0
                ? root.find(j.FunctionDeclaration, { id: { name: 'zoom' } }).get().value.body
                : j.blockStatement([])).toSource()}
    }
}`;

    // 7. 创建 sgn-presets.js
    const presetsProperties = settingsObject.value.properties.filter(p =>
        p.key && (p.key.name === 'presets' || p.key.name === 'penColors' || p.key.name === 'speedSettings'));

    const presetsContent = `
var sgnPresets = {
    ${presetsProperties.map(p => `${p.key.name}: ${j(p.value).toSource()}`).join(',\n    ')}
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
