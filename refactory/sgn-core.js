// 全局设置对象
var sgnSettings = {
    "draw": false,
    "i": 0,
    "iOffset": 90,
    "iPosition": 0,
    "iterator": .25,
    "zoom": .25,
    "zoomStack": [1],
    "currentZoom": 1,
    "curvePoints": [],
    "url": "#",
    "circles": "show",
    "circleColor": "LightGrey",
    "circleStroke": 3,
    "circleReset": false,
    "offsetT": 0,
    "offsetL": 0,
    "penStart": {
        "x": 0,
        "y": 0
    },
    "drawing": false,
    "idNames": {
        "linkId": "linkId",
        "sidebar": "sidebar",
        "pad": "pad",
        "stator": "stator",
        "rotors": "rotors",
        "item": "item",
        "rotor": "rotor",
        "e": "e",
        "h": "h",
        "pen": "pen",
        "width": "width",
        "speed": "speed",
        "color": "color",
        "colors": "colors",
        "type": "type",
        "delete": "delete",
        "deleteLabel": "deleteLabel",
        "add": "add",
        "addLabel": "addLabel",
        "draw": "draw",
        "clear": "clear",
        "clearLabel": "clearLabel",
        "clearIcon": "clearIcon",
        "reset": "reset",
        "resetLabel": "resetLabel",
        "resetIcon": "resetIcon",
        "restart": "restart",
        "restartLabel": "restartLabel",
        "restartIcon": "restartIcon",
        "hide": "hide",
        "hideLabel": "hideLabel",
        "hideIcon": "hideIcon",
        "preset": "preset",
        "canvasCircles": "canvasCircles",
        "canvasPen": "canvasPen",
        "deleteLine": "deleteLine",
        "deleteSep": "deleteSep",
        "deleteBlock": "deleteBlock",
        "download": "download",
        "presets": "presets",
        "rotate": "rotate",
        "rotateLabel": "rotateLabel",
        "rotateIcon": "rotateIcon",
        "open": "open",
        "openLabel": "openLabel",
        "openIcon": "openIcon",
        "git": "git"
    }
};

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
        load: function (sidebarId, canvasDivId) {
            ui.initUI(sidebarId, canvasDivId);
            drawing.setupCanvas();
        },
        spot: function (d) {
            // 这个函数在原始代码中没有明确实现，但被引用
            // 根据上下文，它可能是用于处理特定点的函数
            console.log("Spot function called with:", d);
        }
    };
})();
