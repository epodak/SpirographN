/*
The MIT License (MIT) - See sgn-settings.js for full license
*/

var sgn = (function () {
    'use strict';

    // 公共接口
    return {
        load: load,
        spot: spot
    };

    // 加载函数
    function load(sidebarId, canvasDivId) {
        // 建立sidebar和pad
        if (!sidebarId || !canvasDivId) {
            alert("Error:Canvas and Sidebar not specified");
            return;
        }

        // 初始化UI
        sgnUI.initUI(sidebarId, canvasDivId);

        // 绘制画布
        sgnDrawing.drawCanvas();
    }

    // 特定点处理函数
    function spot(d) {
        var d = {
            "a": "600",
            "b": "600",
            "sz": "600",
            "canvasClass": "pad",
            "closeFunction": "close",
            "sr": "250",
            "r1": "125h",
            "pen": "125"
        };
        // 实现spot函数的其余部分
    }
})();
