/*
The MIT License (MIT) - See sgn-settings.js for full license
*/

var sgnUI = (function (settings) {
    'use strict';

    // 公共接口
    return {
        initUI: initUI,
        toggleSidebar: toggleSidebar,
        addButton: addButton,
        deleteButton: deleteButton,
        makeButton: makeButton,
        makeImage: makeImage,
        makeSpan: makeSpan,
        drawButton: drawButton,
        clearButton: clearButton,
        restartButton: restartButton,
        hideButton: hideButton,
        openImageButton: openImageButton,
        settingsURLButton: settingsURLButton,
        zoomInButton: zoomInButton,
        zoomOutButton: zoomOutButton,
        rotateButton: rotateButton,
        resetButton: resetButton,
        gitButton: gitButton,
        loadValues: loadValues,
        addRotor: addRotor,
        setValues: setValues,
        colorInputOK: colorInputOK,
        inputEvent: inputEvent,
        presetEvent: presetEvent
    };

    // 初始化UI
    function initUI(sidebarId, canvasDivId) {
        // 这里实现UI初始化逻辑，基于原始load函数
        // ...
    }

    // 侧边栏切换功能
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
        setTimeout(sgnDrawing.resizeCanvas, 300);
    }

    // 添加按钮
    function addButton() {
        // 原始addButton函数的实现
        // ...
    }

    // 删除按钮
    function deleteButton() {
        // 原始deleteButton函数的实现
        // ...
    }

    // 其他UI相关函数...
    // 这里包括所有原始的UI相关函数
})(sgnSettings);
