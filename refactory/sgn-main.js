// 主应用程序文件
(function () {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function () {
        // 初始化应用程序
        sgn.load('sidebar', 'pad');
    });

    // 添加窗口加载事件
    window.addEventListener('load', function () {
        // 处理URL参数
        var parms = location.search.substring(1).split("&");
        if (parms[0]) {
            var d = {};
            for (var c in parms) {
                var a = parms[c].split("=");
                d[a[0]] = decodeURIComponent(a[1]);
            }
            if (d["cl"]) {
                // 添加颜色前缀
                d["cl"] = "#" + d["cl"];
            }

            if (d["pre"]) {
                // 如果指定了预设，使用该预设
                for (var c in sgnSettings.presets) {
                    if (sgnSettings.presets[c].name === d["pre"]) {
                        d = sgnSettings.presets[c];
                    }
                }
            }

            // 加载参数
            var ui = sgnUI(sgnSettings);
            ui.loadValues(d);
        }
    });
})();
