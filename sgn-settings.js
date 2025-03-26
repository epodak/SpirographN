/*
The MIT License (MIT)

Copyright (c) 2016 SeedCode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// 全局设置对象
var sgnSettings = {
    // 从原始settings对象复制所有属性
    sidebarDiv: null,
    divCanvas: null,
    canvasCircles: null,
    canvasPen: null,
    draw: false,
    circles: "show",
    circleReset: false,
    i: 0,
    iterator: 360,
    timer: 0,
    currentZoom: 1,
    iPosition: 0,
    iOffset: 15,
    circleColor: "#cccccc",
    circleStroke: 0.3,
    curveColor: "#000000",
    curveWidth: 1,
    numRotors: 1,
    penStart: { x: 0, y: 0 },
    curvePoints: [{ x: 0, y: 0 }],
    radii: [],
    types: [],
    pitches: [],
    drawPitches: [],
    spinPitches: [],
    directions: [],

    // ID名称
    idNames: {
        sidebar: "sidebar",
        pad: "pad",
        presets: "presets",
        stator: "stator",
        rotors: "rotors",
        deleteBlock: "deleteBlock",
        deleteLine: "deleteLine",
        deleteSep: "deleteSep",
        delete: "delete",
        deleteLabel: "deleteLabel",
        item: "item",
        add: "add",
        rotor: "rotor",
        h: "h",
        e: "e",
        pen: "pen",
        width: "width",
        color: "color",
        speed: "speed",
        draw: "draw",
        clear: "clear",
        clearIcon: "clearIcon",
        restart: "restart",
        restartIcon: "restartIcon",
        hide: "hide",
        hideIcon: "hideIcon",
        open: "open",
        openIcon: "openIcon",
        link: "link",
        linkIcon: "linkIcon",
        zoomIn: "zoomIn",
        zoomInIcon: "zoomInIcon",
        zoomOut: "zoomOut",
        zoomOutIcon: "zoomOutIcon",
        angle: "angle",
        rotate: "rotate",
        rotateIcon: "rotateIcon",
        reset: "reset",
        resetIcon: "resetIcon",
        git: "git",
        gitIcon: "gitIcon",
        gitLabel: "gitLabel",
        canvasCircles: "canvasCircles",
        canvasPen: "canvasPen"
    },

    // 预设
    presets: [
        {
            name: "花朵",
            st: 250,
            r1: "125h",
            pen: 125,
            wd: 1,
            cl: "#ff0000",
            sp: 1
        },
        {
            name: "螺旋",
            st: 200,
            r1: "100h",
            r2: "50h",
            pen: 50,
            wd: 1,
            cl: "#0000ff",
            sp: 1
        },
        {
            name: "复杂图案",
            st: 300,
            r1: "150h",
            r2: "75e",
            r3: "37h",
            pen: 37,
            wd: 1,
            cl: "#00aa00",
            sp: 1
        }
    ],

    // 颜色预设
    penColors: [
        { name: "黑色", hex: "#000000" },
        { name: "红色", hex: "#ff0000" },
        { name: "绿色", hex: "#00aa00" },
        { name: "蓝色", hex: "#0000ff" },
        { name: "黄色", hex: "#ffff00" }
    ],

    // 速度设置
    speedSettings: [
        { name: "慢速", speed: 1 },
        { name: "中速", speed: 5 },
        { name: "快速", speed: 20 },
        { name: "极速", speed: 100 }
    ]
};
