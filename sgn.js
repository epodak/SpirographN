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

var sgn = (function (settings) {
	'use strict'

	// Initialize settings if it's not already set
	settings = settings || {};
	// Enable 3D mode settings
	settings.enable3D = false; // Flag to toggle between 2D and 3D mode
	settings.three = {
		scene: null,
		camera: null,
		renderer: null,
		controls: null,
		points: [], // To store the 3D points
		container: null,
		line: null, // The 3D curve
		circles: [] // The 3D circles
	};

	return {
		load: load,
		spot: spot,
	}

	//public functions

	function load(sidebarId, canvasDivId) {

		var v;
		var r;
		var t;
		var n;
		var c;
		var a;
		var d;
		var o;
		var i;

		//establish sidebar and pad
		if (!sidebarId || !canvasDivId) {
			alert("Error:Canvas and Sidebar not specified");
			return;
		}

		settings.sidebarDiv = document.getElementById(sidebarId);
		settings.divCanvas = document.getElementById(canvasDivId);

		//preserve ids specified in ininitial call
		settings.idNames.sidebar = sidebarId;
		settings.idNames.pad = canvasDivId;

		//set classes
		settings.sidebarDiv.className = "sidebar";
		settings.divCanvas.className = "pad";

		//create data object from url
		//load preset/favorote from settings if none retrieved from the URL
		var parms = location.search.substring(1).split("&");
		if (parms[0]) {
			d = {};
			for (c in parms) {
				a = parms[c].split("=");
				d[a[0]] = decodeURIComponent(a[1]);
			}
			if (d["cl"]) {
				//append hash to color
				d["cl"] = "#" + d["cl"];
			}

			if (d["pre"]) {
				//a preset was passed, so use that
				for (c in settings.presets) {
					if (settings.presets[c].name === d["pre"]) {
						d = settings.presets[c];
					}
				}
			}
			if (!d["st"] || !d["r1"] || !d["pen"]) {
				//validate object properties or else load pre-set
				var preSet = Math.round(Math.random() * (settings.presets.length - 1));
				d = settings.presets[preSet];
			}
			if (!d["sp"]) {
				//set speed if not specified
				d["sp"] = 1;
			}
		} else {
			//no parms specified
			var preSet = Math.round(Math.random() * (settings.presets.length - 1));
			d = settings.presets[preSet];
		}

		//remove rotors to start clean
		while (settings.sidebarDiv.firstChild) {
			settings.sidebarDiv.removeChild(settings.sidebarDiv.firstChild);
		}

		//Begin creating sidebar elements

		//add static elements and values from preset
		// 在创建标题后添加侧边栏切换按钮
		var e = document.createElement("SPAN");
		e.className = "title";
		e.innerHTML = "Spirograph";
		e.innerHTML += '<span class="n">&#8319;</span>';

		// 添加侧边栏切换按钮
		var toggleBtn = document.createElement("BUTTON");
		toggleBtn.className = "sidebar-toggle";
		toggleBtn.innerHTML = "◀";
		toggleBtn.setAttribute("title", "隐藏侧边栏");
		toggleBtn.onclick = toggleSidebar;
		e.appendChild(toggleBtn);

		settings.sidebarDiv.appendChild(e);

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);


		e = document.createElement("SPAN");
		e.className = "label";
		e.innerHTML = "presets";
		settings.sidebarDiv.appendChild(e);

		var sel = document.createElement("SELECT");
		sel.className = "preset";
		sel.setAttribute("name", "presets");
		sel.setAttribute("id", settings.idNames.presets);
		for (c in settings.presets) {
			o = document.createElement("OPTION");
			o.setAttribute("value", settings.presets[c].name);
			o.innerHTML = settings.presets[c].name;
			sel.appendChild(o);
		}
		settings.sidebarDiv.appendChild(sel)
		presetEvent(settings.idNames.presets, "change");

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "label";
		e.innerHTML = "stator";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "letterLabel";
		e.innerHTML = "sr";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("INPUT");
		e.className = "number";
		e.setAttribute("type", "text");
		e.setAttribute("value", d.st);
		e.setAttribute("id", settings.idNames.stator);
		settings.sidebarDiv.appendChild(e);
		inputEvent(settings.idNames.stator, "input");

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "label";
		e.innerHTML = "rotors";
		settings.sidebarDiv.appendChild(e);

		addButton();

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("DIV");
		e.className = "rotors";
		e.setAttribute("id", settings.idNames.rotors);
		settings.sidebarDiv.appendChild(e);

		//add delete block
		e = document.createElement("DIV");
		e.setAttribute("id", settings.idNames.deleteBlock);
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		//add pen block first as rotor routine appends values;
		e = document.createElement("SPAN");
		e.className = "label";
		e.innerHTML = "pen";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "letterLabel";
		e.innerHTML = "r";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("INPUT");
		e.className = "number";
		e.setAttribute("type", "text");
		e.setAttribute("id", settings.idNames.pen);
		settings.sidebarDiv.appendChild(e);
		inputEvent(settings.idNames.pen, "input");

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "letterLabel";
		e.innerHTML = "w";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("INPUT");
		e.className = "number";
		e.setAttribute("type", "text");
		e.setAttribute("id", settings.idNames.width);
		e.setAttribute("step", ".01");
		settings.sidebarDiv.appendChild(e);
		inputEvent(settings.idNames.width, "input");

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "letterLabel";
		e.innerHTML = "c";
		settings.sidebarDiv.appendChild(e);

		if (colorInputOK()) {
			//load color input
			e = document.createElement("INPUT");
			e.className = "color";
			e.setAttribute("type", "color");
			e.setAttribute("id", settings.idNames.color);
			settings.sidebarDiv.appendChild(e);
			inputEvent(settings.idNames.color, "input");
		} else {
			//load select color list if color input unavailable
			var e = document.createElement("SELECT");
			e.className = "text";
			e.setAttribute("name", "colors");
			e.setAttribute("id", settings.idNames.color);
			for (c in settings.penColors) {
				o = document.createElement("OPTION");
				o.setAttribute("value", settings.penColors[c].hex);
				o.innerHTML = settings.penColors[c].name;
				e.appendChild(o);
			}
			settings.sidebarDiv.appendChild(e)
			inputEvent(settings.idNames.color, "change");
		}

		settings.sidebarDiv.appendChild(e);

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("SPAN");
		e.className = "label";
		e.innerHTML = "speed";
		settings.sidebarDiv.appendChild(e);

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		var e = document.createElement("SELECT");
		e.className = "preset";
		e.setAttribute("name", "speeds");
		e.setAttribute("id", settings.idNames.speed);
		for (c in settings.speedSettings) {
			o = document.createElement("OPTION");
			o.setAttribute("value", settings.speedSettings[c].speed);
			o.innerHTML = settings.speedSettings[c].name;
			e.appendChild(o);
		}
		settings.sidebarDiv.appendChild(e)
		inputEvent(settings.idNames.speed, "change");

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		drawButton();

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		//utility buttons

		clearButton();

		restartButton();

		hideButton();

		openImageButton();

		settingsURLButton();

		e = document.createElement("BR");
		settings.sidebarDiv.appendChild(e);

		zoomInButton();

		zoomOutButton();

		e = document.createElement("INPUT");
		e.className = "angle";
		e.setAttribute("type", "text");
		e.setAttribute("id", settings.idNames.angle);
		e.setAttribute("value", settings.iOffset);
		e.setAttribute("title", "rotation increment");
		settings.sidebarDiv.appendChild(e);
		inputEvent(settings.idNames.angle, "input");

		rotateButton();

		resetButton();

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		gitButton();

		e = document.createElement("DIV");
		e.className = "divSeparator";
		settings.sidebarDiv.appendChild(e);

		// Add 3D mode toggle button
		toggle3DButton();

		//load canvas
		setValues();

		//add canvas
		drawCanvas();

		//load values into inputs
		var lr = loadValues(d);

		window.onresize = function (e) {
			resizeCanvas(e);
		};

		var rotorsDiv = document.getElementById('rotors');
		rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
	}

	function spot(d) {
		var d = {
			"a": "600",
			"b": "600",
			"sz": "600",
			"canvasClass": "pad",
			"closeFunction": "close",
			"sr": "250",
			"r1": "125h",
			"pen": "125",



		}

	}
	// 添加侧边栏切换功能
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
		setTimeout(resizeCanvas, 300);
	}
	// buttons

	function addButton() {

		var b = document.createElement("BUTTON");
		b.setAttribute("class", "button add");
		b.setAttribute("id", settings.idNames.add);
		var i = document.createElement("IMG");
		i.className = "add";
		i.setAttribute("src", "img/add.png");
		b.appendChild(i);
		var s = document.createElement("SPAN");
		s.className = "buttonTextSmall"
		s.innerHTML += "add rotor";
		b.appendChild(s);
		settings.sidebarDiv.appendChild(b);


		b.addEventListener("click", function () {

			//get current last rotor radius
			var newRad = document.getElementById(settings.idNames.rotor + settings.numRotors).value / 2;

			//toggle types
			if (document.getElementById(settings.idNames.e + settings.numRotors).checked) {
				var type = "h";
			} else {
				var type = "e";
			}

			settings.numRotors++;

			addRotor(settings.numRotors, newRad, type);

			//update pen radius
			document.getElementById(settings.idNames.pen).value = newRad;

			var rotorsDiv = document.getElementById('rotors');
			rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';

			//if this is the second rotor we need our delete button.
			if (settings.numRotors === 2) {
				deleteButton();
			}

			//scroll to the bottom
			document.getElementById(settings.idNames.rotors).scrollTop = document.getElementById(settings.idNames.rotors).scrollHeight;

			setValues();
			if (!settings.draw) {
				drawCircles();
			}

		});

	}

	function deleteButton() {
		var div = document.getElementById(settings.idNames.deleteBlock);
		var e = document.createElement("DIV");
		e.className = "divSeparator";
		e.setAttribute("id", settings.idNames.deleteSep);
		div.appendChild(e);
		var span = document.createElement("SPAN");
		span.setAttribute("id", settings.idNames.deleteLine);
		div.appendChild(span);
		var b = document.createElement("BUTTON");
		b.className = "delete";
		b.setAttribute("id", settings.idNames.delete);
		span.appendChild(b);
		e = document.createElement("IMG");
		e.className = "delete";
		e.setAttribute("src", "img/delete.png");
		b.appendChild(e);
		e = document.createElement("SPAN");
		e.className = "buttonTextSmall"
		e.innerHTML = "delete last rotor"
		e.setAttribute("id", settings.idNames.deleteLabel)
		b.appendChild(e);
		b.addEventListener("click", function () {
			var element = document.getElementById(settings.idNames.item + settings.numRotors);
			element.parentNode.removeChild(element);
			if (settings.numRotors === 2) {
				var element = document.getElementById(settings.idNames.deleteLine);
				element.parentNode.removeChild(element);
				var element = document.getElementById(settings.idNames.deleteSep);
				element.parentNode.removeChild(element);
			};
			settings.numRotors--;
			document.getElementById(settings.idNames.pen).value = document.getElementById(settings.idNames.rotor + settings.numRotors).value;
			setValues();
			if (!settings.draw) {
				drawCircles();
			}
			//scroll to the bottom
			var div = document.getElementById(settings.idNames.rotors);
			div.scrollTop = div.scrollHeight;

			var rotorsDiv = document.getElementById('rotors');
			rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
		});

	}

	function makeButton(id, className, title, text) {
		var b = document.createElement("BUTTON");
		if (className) {
			b.setAttribute("class", className);
		}
		if (id) {
			b.setAttribute("id", id);
		}
		if (title) {
			b.setAttribute("title", title);
		}
		if (text) {
			b.innerHTML = text;
		}
		return b;
	}

	function makeImage(id, className, src) {
		var i = document.createElement("IMG");
		if (className) {
			i.setAttribute("class", className);
		}
		if (id) {
			i.setAttribute("id", id);
		}
		if (src) {
			i.setAttribute("src", src);
		}
		return i;
	}

	function makeSpan(id, className, content) {
		var s = document.createElement("SPAN");
		if (className) {
			s.setAttribute("class", className);
		}
		if (content) {
			s.innerHTML = content;
		}
		if (id) {
			s.setAttribute("id", id);
		}
		return s;
	}

	function drawButton() {
		var button = makeButton(settings.idNames.draw, "draw", false, "draw");
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			//toggle drawing on and off
			if (!settings.draw) {
				console.log("开始绘制，模式：" + (settings.enable3D ? "3D" : "2D"));
				//calculate in seconds
				settings.timer = new Date().getTime() / 1000;
				settings.draw = true;
				button.innerHTML = "pause";
				setValues();
				
				// 重置起始点和起始位置
				settings.i = 0;
				settings.curvePoints = [];
				
				// 如果在3D模式下，确保曲线已初始化
				if (settings.enable3D) {
					console.log("初始化3D曲线");
					
					// 清除所有现有的点和曲线
					settings.three.points = [];
					
					// 强制重新创建曲线
					clear3DScene();
					
					// 重绘3D齿轮状态
					drawCircles3D();
					
					// 确保画笔位置正确初始化
					if (settings.pen) {
						// 保存初始画笔位置，用于检测完整循环
						settings.penStart = {
							x: settings.pen.x,
							y: settings.pen.y
						};
						
						// 初始化曲线点
						settings.curvePoints = [
							{x: settings.pen.x, y: settings.pen.y},
							{x: settings.pen.x, y: settings.pen.y}
						];
					}
					
					// 确保渲染
					if (settings.three.renderer && settings.three.scene && settings.three.camera) {
							settings.three.renderer.render(settings.three.scene, settings.three.camera);
					}
				} else {
					// 在2D模式下，重绘圆圈
					drawCircles();
				}
				
				// 开始绘制循环
				requestAnimationFrame(draw);
			} else {
				settings.draw = false;
				button.innerHTML = "draw";
			}
		});
	}

	function clearButton() {
		var button = makeButton(settings.idNames.clear, false, "clear drawing", false);
		var image = makeImage(settings.idNames.clearIcon, "edit", "img/clear.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", clearCanvas);
	}

	function restartButton() {
		var button = makeButton(settings.idNames.restart, false, "reset pen to beginning position", false);
		var image = makeImage(settings.idNames.clearIcon, "edit", "img/restart.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", restart);
	}

	function hideButton() {
		var button = makeButton(settings.idNames.hide, false, "hide circles", false);
		var image = makeImage(settings.idNames.hideIcon, "edit", "img/hide.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			if (settings.circles === "show") {
				settings.circles = "hide";
				button.setAttribute("title", "show circles");
				setValues();
				
				// 在3D模式下也处理齿轮的隐藏显示
				if (settings.enable3D) {
					// 隐藏3D齿轮组
					if (settings.three.spirographGroup) {
						// 保存曲线对象
						let curve = settings.three.line;
						
						// 遍历并隐藏除了曲线以外的所有对象
						for (let i = 0; i < settings.three.spirographGroup.children.length; i++) {
							const obj = settings.three.spirographGroup.children[i];
							if (obj !== curve) {
								obj.visible = false;
							}
						}
						
						// 确保渲染更新
						if (settings.three.renderer && settings.three.scene && settings.three.camera) {
							settings.three.renderer.render(settings.three.scene, settings.three.camera);
						}
					}
				} else {
					// 2D模式下正常处理
					drawCircles();
				}
			} else {
				settings.circles = "show";
				button.setAttribute("title", "hide circles");
				setValues();
				
				// 在3D模式下也处理齿轮的隐藏显示
				if (settings.enable3D) {
					// 显示3D齿轮组
					if (settings.three.spirographGroup) {
						// 遍历并显示所有对象（除了曲线，因为它应该始终可见）
						for (let i = 0; i < settings.three.spirographGroup.children.length; i++) {
							const obj = settings.three.spirographGroup.children[i];
							if (obj !== settings.three.line) {
								obj.visible = true;
							}
						}
						
						// 重绘3D齿轮
						drawCircles3D();
						
						// 确保渲染更新
						if (settings.three.renderer && settings.three.scene && settings.three.camera) {
							settings.three.renderer.render(settings.three.scene, settings.three.camera);
						}
					}
				} else {
					// 2D模式下正常处理
					drawCircles();
				}
			}
		});
	}

	function openImageButton() {
		var button = makeButton(settings.idNames.open, false, "open drawing in new tab", false);
		var image = makeImage(settings.idNames.openIcon, "edit", "img/open.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			var d = settings.canvasPen.toDataURL();
			var newTab = window.open();
			var img = newTab.document.createElement('img');
			img.src = d;
			var title = newTab.document.createElement('title');
			title.innerHTML = 'Spirograph&#8319; Image';
			newTab.document.head.appendChild(title);
			newTab.document.body.appendChild(img);
		});
	}

	function settingsURLButton() {
		var button = makeButton(settings.idNames.link, false, "URL for drawing settings", false);
		var image = makeImage(settings.idNames.linkIcon, "edit", "img/link.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			window.open(settings.url);
		});
	}

	function zoomInButton() {
		var button = makeButton(settings.idNames.zoomIn, false, "zoom drawing tools in", false);
		var image = makeImage(settings.idNames.zoomInIcon, "edit", "img/zoomIn.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			zoom("in");
		});
	}

	function zoomOutButton() {
		var button = makeButton(settings.idNames.zoomOut, false, "zoom drawing tools out", false);
		var image = makeImage(settings.idNames.zoomOutIcon, "edit", "img/zoomOut.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			zoom("out");
		});
	}

	function rotateButton() {
		var button = makeButton(settings.idNames.rotate, false, "rotate drawing tools", false);
		var image = makeImage(settings.idNames.rotateIcon, "edit", "img/rotate.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", rotateDrawing);
	}

	function resetButton() {
		var button = makeButton(settings.idNames.reset, false, "clear zoom and rotation", false);
		var image = makeImage(settings.idNames.resetIcon, "edit", "img/reset.png");
		button.appendChild(image);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", reset);
	}

	function gitButton() {
		var button = makeButton(settings.idNames.git, false, "clear zoom and rotation", false);
		button.setAttribute("style", "width:100%");
		var image = makeImage(settings.idNames.gitIcon, "git", "img/gh.png");
		var span = makeSpan(settings.idNames.gitLabel, "buttonText", "download at github");
		button.appendChild(image);
		button.appendChild(span);
		settings.sidebarDiv.appendChild(button);
		button.addEventListener("click", function () {
			window.open("https://github.com/seedcode/SpirographN");
		});
	}

	// Add 3D mode toggle button
	function toggle3DButton() {
		var button = document.createElement("BUTTON");
		button.className = "button";
		button.id = settings.idNames.toggle3D;
		button.innerHTML = "3D";
		button.setAttribute("title", "Enable 3D mode");
		settings.sidebarDiv.appendChild(button);
		
		// 创建网格控制按钮，但先不添加到页面
		var gridButton = toggleGridButton();
		
		button.addEventListener("click", function () {
			if (settings.enable3D) {
				// 切换回2D模式
				console.log("切换到2D模式");
				settings.enable3D = false;
				button.innerHTML = "3D";
				button.setAttribute("title", "Enable 3D mode");
				
				// 隐藏网格控制按钮
				gridButton.style.display = 'none';
				
				// 隐藏Three.js渲染器
				if (settings.three.container) {
					settings.three.container.style.display = 'none';
				}
				
				// 显示2D画布
				settings.canvasCircles.style.display = 'block';
				settings.canvasPen.style.display = 'block';
				
				// 在2D模式下重绘
				clearCanvas();
				settings.i = 0; // 重置位置
				drawCircles();
			} else {
				// 切换到3D模式
				console.log("切换到3D模式");
				settings.enable3D = true;
				button.innerHTML = "2D";
				button.setAttribute("title", "Disable 3D mode");
				
				// 显示网格控制按钮
				gridButton.style.display = 'block';
				
				// 初始化Three.js（如果还没初始化）
				if (!settings.three.scene) {
					console.log("初始化3D场景");
					init3D();
				}
				
				// 显示Three.js渲染器
				if (settings.three.container) {
					settings.three.container.style.display = 'block';
				}
				
				// 隐藏2D画布
				settings.canvasCircles.style.display = 'none';
				settings.canvasPen.style.display = 'none';
				
				// 在3D模式下重绘
				clearCanvas();
				settings.i = 0; // 重置位置
				
				// 清除3D场景
				clear3DScene();
				
				// 绘制齿轮
				drawCircles3D();
				
				// 确保轨道控制器启用
				if (settings.three.controls) {
					settings.three.controls.enabled = true;
				}
				
				// 如果需要继续绘制，重新启动
				if (settings.draw) {
					restart3D();
				}
			}
		});
	}

	// private functions

	function loadValues(d) {

		//set values from d. d is either a loaded preset or created from the url
		document.getElementById(settings.idNames.stator).value = d.st;
		document.getElementById(settings.idNames.pen).value = d.pen;
		document.getElementById(settings.idNames.width).value = d.wd;
		document.getElementById(settings.idNames.color).value = d.cl;
		document.getElementById(settings.idNames.speed).value = d.sp;
		document.getElementById(settings.idNames.presets).value = d.name;

		//remove rotors to start clean
		var rotors = document.getElementById(settings.idNames.rotors);
		while (rotors.firstChild) {
			rotors.removeChild(rotors.firstChild);
		}

		//loop to add rotors
		var c = 1;
		var v;
		var r;
		var t;
		while (d["r" + c]) {
			v = d["r" + c];
			r = v.substring(0, v.length - 1);
			t = v.substring(v.length - 1);
			addRotor(c, r, t);
			c++;
		}

		//track (and maintain) number of rotors
		settings.numRotors = c - 1;

		//if we only have one rotor, then we don't want the delete button.
		if (settings.numRotors === 1 && document.getElementById(settings.idNames.deleteLine)) {
			var element = document.getElementById(settings.idNames.deleteLine);
			element.parentNode.removeChild(element);
			var element = document.getElementById(settings.idNames.deleteSep);
			element.parentNode.removeChild(element);
		};

		//create delete button if we need and don't have
		if (settings.numRotors > 1 && document.getElementById(settings.idNames.delete) === null) {
			deleteButton()
		}

		//write values from inputs to settings
		setValues();

		//if we're not drawing, then we'll show the circles on change
		if (!settings.draw) {
			settings.circles = "show";
			document.getElementById(settings.idNames.hide).setAttribute("title", "hide circles");
		}

		//reset if we're not drawing
		if (!settings.draw) {
			reset();
			drawCircles();
		}

		//return number of rotors created
		return c - 1;
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
		inputEvent(settings.idNames.rotor + num, "input");

		//type
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
		inputEvent(settings.idNames.h + num, "click");

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
		inputEvent(settings.idNames.e + num, "click");

		e = document.createElement("SPAN");
		e.className = "letterLabel";
		e.innerHTML = "e";
		item.appendChild(e);
	}

	function setValues() {

		settings.radii = [document.getElementById(settings.idNames.stator).value];
		settings.curveColor = document.getElementById(settings.idNames.color).value;
		settings.curveWidth = document.getElementById(settings.idNames.width).value;
		settings.penRad = [document.getElementById(settings.idNames.pen).value];
		settings.speed = document.getElementById(settings.idNames.speed).value;
		settings.iOffset = document.getElementById(settings.idNames.angle).value;

		settings.types = [""];
		settings.pitches = [1];
		settings.drawPitches = [];
		settings.spinPitches = []

		var c = 1;
		var thisId = settings.idNames.rotor + c;
		var thisHId = settings.idNames.h + c;
		var thisEId = settings.idNames.e + c;

		var thisRotor;
		var thisType;
		var thisHId;
		var thisEId;

		//build arrays
		while (document.getElementById(thisId)) {
			thisRotor = document.getElementById(thisId).value;
			settings.radii.push(thisRotor);

			if (document.getElementById(thisHId).checked) {
				settings.types.push("h");
				if (c > 1) {
					settings.drawPitches.push(settings.spinPitches[c - 2]);
					settings.spinPitches.push((settings.radii[c - 1] / thisRotor) - 1);
					if (settings.types[c - 1] === "h") {
						settings.directions.push(settings.directions[c - 1]);
					} else {
						settings.directions.push(settings.directions[c - 1] * -1);
					}
				} else {
					settings.directions = [1, 1];
					settings.drawPitches.push(1);
					settings.spinPitches.push((settings.radii[c - 1] / thisRotor) - 1);
				}
			} else {
				settings.types.push("e");
				if (c > 1) {
					settings.drawPitches.push(settings.spinPitches[c - 2]);
					settings.spinPitches.push((settings.radii[c - 1] / thisRotor) + 1);
					if (settings.types[c - 1] === "h") {
						settings.directions.push(settings.directions[c - 1]);
					} else (
						settings.directions.push(settings.directions[c - 1] * -1)
					)
				} else {
					settings.directions = [1, 1];
					settings.drawPitches.push(1);
					settings.spinPitches.push((settings.radii[c - 1] / thisRotor) + 1);

				}
			}
			c++;
			thisId = settings.idNames.rotor + c;
			thisHId = settings.idNames.h + c;
			thisEId = settings.idNames.e + c;
		}
		settings.numRotors = c - 1;

		//create url string for this config
		c = 0;
		var u = window.location.origin + window.location.pathname;
		for (c in settings.radii) {
			if (c == 0) {
				u += "?st=" + settings.radii[c];
			} else {
				u += "&r" + c + "=" + settings.radii[c] + settings.types[c];
			}
		}
		u += "&pen=" + settings.penRad;
		u += "&wd=" + settings.curveWidth;
		u += "&cl=" + settings.curveColor.substring(1);
		settings.url = u;
	}

	function drawCanvas() {
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
		// If we're in 3D mode, use the 3D drawing
		if (settings.enable3D) {
			drawCircles3D();
			return;
		}

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
			
			// 保存最后的画笔位置用于曲线绘制
			settings.pen = penPt;
			
			if (c === settings.radii.length - 1) {
				//store final rotor
				settings.currentRotorCenter = pt;
				settings.thisRad = thisRad;
				settings.penPitch = penPitch;
			}
			
			c++;
		}
		
		//draw Pen Arm
		if (settings.circles === "show") {
			//draw Pen
			var ctx = settings.canvasCircles.getContext("2d");
			ctx.beginPath();
			ctx.strokeStyle = settings.circleColor;
			ctx.lineWidth = settings.circleStroke / 2;
			ctx.moveTo(settings.currentRotorCenter.x, settings.currentRotorCenter.y);
			ctx.lineTo(settings.pen.x, settings.pen.y);
			ctx.stroke();
			ctx.closePath();
		}
		
		//draw Pen
		if (settings.circles === "show") {
			drawOneCircle(settings.canvasCircles, settings.pen.x, settings.pen.y, 1, false);
		}
		
		//store pen data
		if (settings.curvePoints.length < 1) {
			settings.curvePoints.push({
				"x": settings.pen.x,
				"y": settings.pen.y
			});
			settings.penStart = {
				"x": settings.pen.x,
				"y": settings.pen.y
			};
		}
		settings.curvePoints[0] = settings.curvePoints[1] || settings.curvePoints[0];
		settings.curvePoints[1] = {
			"x": settings.pen.x,
			"y": settings.pen.y
		};
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
		// If we're in 3D mode, draw the curve in 3D
		if (settings.enable3D) {
			drawCurve3D();
			return;
		}
		
		// 确保有曲线点
		if (!settings.curvePoints || settings.curvePoints.length < 2) {
			return;
		}
		
		var ctx = settings.canvasPen.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = settings.curveColor;
		ctx.lineWidth = parseFloat(settings.curveWidth) + 0.001;
		ctx.moveTo(settings.curvePoints[0].x, settings.curvePoints[0].y);
		ctx.lineTo(settings.curvePoints[1].x, settings.curvePoints[1].y);
		ctx.stroke();
		ctx.closePath();
	}
	
	function drawCurve3D() {
		// 检查是否有曲线点
		if (!settings.curvePoints || settings.curvePoints.length < 2) {
			console.log('没有足够的曲线点用于3D绘制');
			return;
		}
		
		try {
			// 获取点
			const p1 = settings.curvePoints[0];
			const p2 = settings.curvePoints[1];
			
			// 确保点有效
			if (!p1 || !p2 || typeof p1.x === 'undefined' || typeof p2.x === 'undefined') {
				console.log('曲线点无效');
				return;
			}
			
			// 调整坐标到Three.js坐标系统（以0,0,0为中心）
			// 从canvas坐标转换到以中心为原点的坐标
			const centerX = settings.a;
			const centerY = settings.b;
			
			// 创建3D点 - 目前作为平面（z=0）
			const point = new THREE.Vector3(
				p2.x - centerX, 
				0, // 目前是平面的，z轴为0
				-(p2.y - centerY) // 取负值以匹配Three.js坐标系统
			);
			
			// 调试日志
			console.log(`添加3D点: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}), 点数量: ${settings.three.points.length}`);
			
			// 添加点到我们的3D点数组
			settings.three.points.push(point);
			
			// 确保点不会超过限制，防止性能问题
			const maxPoints = 10000; // 最大点数
			if (settings.three.points.length > maxPoints) {
				// 去除最早的点
				settings.three.points.shift();
			}
			
			// 更新线条几何体
			if (settings.three.line) {
				if (settings.three.points.length > 1) {
					// 使用更新后的点创建新的BufferGeometry
					const geometry = new THREE.BufferGeometry().setFromPoints(settings.three.points);
					
					// 替换旧的几何体
					if (settings.three.line.geometry) {
						settings.three.line.geometry.dispose();
					}
					settings.three.line.geometry = geometry;
					
					// 更新材质颜色
					if (settings.three.line.material) {
						settings.three.line.material.color.set(settings.curveColor);
						settings.three.line.material.needsUpdate = true;
						settings.three.line.material.linewidth = Math.max(1, parseFloat(settings.curveWidth));
					}
				}
			} else {
				// 如果线条不存在，创建一个新的
				console.log('创建新的3D曲线');
				clear3DScene();
			}
			
			// 确保渲染场景
			if (settings.three.renderer && settings.three.scene && settings.three.camera) {
				settings.three.renderer.render(settings.three.scene, settings.three.camera);
			}
		} catch (error) {
			console.error('绘制3D曲线时出错:', error);
		}
	}

	function draw() {
		// 如果处于3D模式，确保曲线已初始化
		if (settings.enable3D && !settings.three.line) {
			console.log('初始化3D曲线');
			clear3DScene();
		}

		// 确保曲线点数组被初始化
		if (!settings.curvePoints || settings.curvePoints.length === 0) {
			settings.curvePoints = [{x: 0, y: 0}, {x: 0, y: 0}];
		}

		// 如果回到了起点，则暂停
		if (
			settings.curvePoints.length >= 2 && 
			settings.draw && 
			settings.i > settings.iterator * 10 && // 确保我们有足够的迭代来形成曲线
			settings.curvePoints[1] && 
			settings.penStart && 
			Math.abs(settings.curvePoints[1].x - settings.penStart.x) < 1 &&
			Math.abs(settings.curvePoints[1].y - settings.penStart.y) < 1
		) {
			console.log('检测到曲线已回到起点，停止绘制');
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

		// 如果按钮被切换
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

		// 调整速度，使每帧最小迭代次数为1
		if (settings.speed < 1) {
			stu = 1;
		} else {
			// 在3D模式下，提高速度倍数以解决旋转慢的问题
			stu = settings.enable3D ? settings.speed * 3 : settings.speed;
		}

		// 如果速度太快，隐藏圆圈
		if (settings.speed > 50 && settings.circles === "show") {
			settings.circles = "hide";
			settings.circleReset = true;
		} else if (settings.speed <= 50 && settings.circleReset && settings.circles === "hide") {
			// 如果速度降低，可以再次显示
			settings.circles = "show";
			settings.circleReset = false;
		}

		// 关闭内部循环的圆圈
		if (settings.circles === "show") {
			settings.circles = "hide";
			var circles = true;
		}

		// 标记设置中存在绘图
		settings.drawing = true;

		// 不使用帧循环速度迭代
		// 这应该至少运行一次
		while (c < stu) {
			// 如果回到了起点，则暂停
			if (
				settings.curvePoints.length >= 2 && 
				settings.draw && 
				settings.i > settings.iterator * 10 && // 确保我们有足够的迭代来形成曲线
				settings.curvePoints[1] && 
				settings.penStart && 
				Math.abs(settings.curvePoints[1].x - settings.penStart.x) < 1 &&
				Math.abs(settings.curvePoints[1].y - settings.penStart.y) < 1
			) {
				console.log('检测到曲线已回到起点，停止绘制');
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
			// 增加迭代计数
			settings.i = settings.i + settings.iterator;
			c = c + settings.iterator;
		}

		// 绘制
		drawCircles();
		drawCurve();

		// 如果速度是小数，则创建timeout
		if (settings.speed < 1) {
			// 3D模式下加快超低速度的更新
			const timeout = settings.enable3D ? 10 / (settings.speed * 3) : 10 / settings.speed;
			setTimeout(draw, timeout);
		} else {
			// 或者只请求下一帧
			requestAnimationFrame(draw);
		}
	}

	function colorInputOK() {
		var test = document.createElement("input");
		//throws an error on IE, so test in try block.
		try {
			test.type = "color";
		} catch (e) {
			return false;
		}
		test.value = "Hello World";
		return (test.value !== "Hello World");
	}

	function inputEvent(inputId, event) {
		var input = document.getElementById(inputId);
		input.addEventListener(event, function (e) {
			setValues();
			if (!settings.draw) {
				drawCircles();
			}
		});
		input.addEventListener('keydown', function (e) {
			if (e.code === 'Minus') {
				e.preventDefault();
			}
		});
		input.addEventListener('paste', function (e) {
			e.preventDefault();
		});
	}

	function presetEvent(inputId, event) {
		var input = document.getElementById(inputId);
		input.addEventListener(event, function (event) {
			var val = this.value;
			var c;
			var i;
			for (c in settings.presets) {
				if (settings.presets[c].name === val) {
					loadValues(settings.presets[c]);
				}
			};
			document.getElementById(settings.idNames.stator).focus();
			var rotorsDiv = document.getElementById('rotors');
			if (rotorsDiv) {
				rotorsDiv.style.height = (settings.numRotors * 27) + (settings.numRotors * 4.3) + 'px';
			}
		});
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
		
		// If in 3D mode, clear the 3D scene as well
		if (settings.enable3D) {
			clear3DScene();
		}

		//restore Zoom
		if (z) {
			zoomTempRestore()
		}
		settings.drawing = false;
	}

	function restart() {
		settings.i = 0;
		setValues();
		
		// 如果在3D模式，重置3D图形
		if (settings.enable3D) {
			// 清除当前3D曲线
			settings.three.points = [];
			if (settings.three.line) {
				if (settings.three.line.geometry) {
					settings.three.line.geometry.dispose();
					settings.three.line.geometry = new THREE.BufferGeometry();
				}
			} else {
				// 如果曲线不存在，初始化它
				clear3DScene();
			}
		}
		
		drawCircles();
	}

	function reset() {
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


		/*



		if (inOut === "in") {
			settings.currentZoom = 1 + settings.zoom;
		} else if (inOut === "out") {
			settings.currentZoom = 1 - settings.zoom;
		}

		var restore;
		var ztu;

		//update stack if moving forward
		if (settings.zoomStack[0] < 1 && settings.currentZoom > 1 || settings.zoomStack[0] > 1 && settings.currentZoom < 1) {
			//we're changing directions so restore to last zoom
			restore = settings.zoomStack.shift();
		} else {
			settings.zoomStack.unshift(settings.currentZoom);
		}

		if (restore) {
			ztu = 1 / restore;
		} else {
			ztu = settings.currentZoom;
		}

		*/

		//clear circles canvas
		//var ctx = settings.canvasCircles.getContext("2d");
		//ctx.clearRect(0, 0, settings.canvasCircles.width, settings.canvasCircles.height);


		//performZoom(ztu);

	}

	function init3D() {
		console.log('Initializing 3D mode...');
		
		// 创建Three.js容器
		settings.three.container = document.createElement('div');
		settings.three.container.id = 'three-container';
		settings.three.container.style.position = 'absolute';
		settings.three.container.style.width = '100%';
		settings.three.container.style.height = '100%';
		settings.three.container.style.left = '0';
		settings.three.container.style.top = '0';
		settings.three.container.style.zIndex = '15'; // 在circles和pen canvas之间
		settings.divCanvas.appendChild(settings.three.container);
		
		// 创建Three.js场景
		settings.three.scene = new THREE.Scene();
		settings.three.scene.background = new THREE.Color(0xffffff); // 白色背景
		
		// 创建相机
		const width = settings.divCanvas.clientWidth - settings.sidebarWidth;
		const height = settings.divCanvasHeight;
		const aspect = width / height;
		settings.three.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
		settings.three.camera.position.set(0, 300, 500); // 初始相机位置
		settings.three.camera.lookAt(0, 0, 0);
		
		// 创建渲染器（带抗锯齿）
		settings.three.renderer = new THREE.WebGLRenderer({ 
			antialias: true,
			alpha: true // 启用透明背景
		});
		settings.three.renderer.setSize(width, height);
		settings.three.renderer.setClearColor(0xffffff, 1); // 设置为白色背景
		settings.three.container.appendChild(settings.three.renderer.domElement);
		
		// 添加轨道控制器
		try {
			console.log('设置轨道控制器...');
			
			// 如果没有加载OrbitControls，先加载它
			if (typeof THREE.OrbitControls === 'undefined') {
				console.log('没有发现OrbitControls，尝试加载...');
				
				// 简单的OrbitControls实现，这将作为备用方案
				THREE.OrbitControls = function(camera, domElement) {
					this.camera = camera;
					this.domElement = domElement;
					this.enabled = true;
					this.target = new THREE.Vector3();
					this.minDistance = 0;
					this.maxDistance = Infinity;
					this.enableZoom = true;
					this.zoomSpeed = 1.0;
					this.enableRotate = true;
					this.rotateSpeed = 1.0;
					this.enablePan = true;
					this.panSpeed = 1.0;
					this.enableDamping = false;
					this.dampingFactor = 0.05;
					
					// 添加旋转和缩放功能的简单实现
					let scope = this;
					let rotateStart = new THREE.Vector2();
					let rotateEnd = new THREE.Vector2();
					let rotateDelta = new THREE.Vector2();
					let panStart = new THREE.Vector2();
					let panEnd = new THREE.Vector2();
					let panDelta = new THREE.Vector2();
					let dollyStart = new THREE.Vector2();
					let dollyEnd = new THREE.Vector2();
					let dollyDelta = new THREE.Vector2();
					let STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2 };
					let state = STATE.NONE;
					
					// 事件监听器
					this.domElement.addEventListener('mousedown', onMouseDown, false);
					this.domElement.addEventListener('mousemove', onMouseMove, false);
					this.domElement.addEventListener('mouseup', onMouseUp, false);
					this.domElement.addEventListener('wheel', onMouseWheel, false);
					
					function onMouseDown(event) {
						if (!scope.enabled) return;
						
						event.preventDefault();
						
						if (event.button === 0) {
							state = STATE.ROTATE;
							rotateStart.set(event.clientX, event.clientY);
						} else if (event.button === 1) {
							state = STATE.DOLLY;
							dollyStart.set(event.clientX, event.clientY);
						} else if (event.button === 2) {
							state = STATE.PAN;
							panStart.set(event.clientX, event.clientY);
						}
					}
					
					function onMouseMove(event) {
						if (!scope.enabled) return;
						
						event.preventDefault();
						
						if (state === STATE.ROTATE) {
							rotateEnd.set(event.clientX, event.clientY);
							rotateDelta.subVectors(rotateEnd, rotateStart);
							
							// 旋转相机
							const element = scope.domElement;
							scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
							scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
							
							rotateStart.copy(rotateEnd);
						} else if (state === STATE.DOLLY) {
							dollyEnd.set(event.clientX, event.clientY);
							dollyDelta.subVectors(dollyEnd, dollyStart);
							
							if (dollyDelta.y > 0) {
								scope.dollyIn(0.95);
							} else if (dollyDelta.y < 0) {
								scope.dollyOut(0.95);
							}
							
							dollyStart.copy(dollyEnd);
						} else if (state === STATE.PAN) {
							panEnd.set(event.clientX, event.clientY);
							panDelta.subVectors(panEnd, panStart);
							
							scope.pan(panDelta.x, panDelta.y);
							
							panStart.copy(panEnd);
						}
						
						scope.update();
					}
					
					function onMouseUp() {
						if (!scope.enabled) return;
						state = STATE.NONE;
					}
					
					function onMouseWheel(event) {
						if (!scope.enabled || !scope.enableZoom) return;
						
						event.preventDefault();
						
						if (event.deltaY < 0) {
							scope.dollyOut(0.95);
						} else {
							scope.dollyIn(0.95);
						}
						
						scope.update();
					}
					
					// 添加旋转方法
					this.rotateLeft = function(angle) {
						const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
						const position = new THREE.Vector3().subVectors(this.camera.position, this.target);
						position.applyQuaternion(quaternion);
						this.camera.position.copy(position.add(this.target));
						this.camera.lookAt(this.target);
					};
					
					this.rotateUp = function(angle) {
						const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle);
						const position = new THREE.Vector3().subVectors(this.camera.position, this.target);
						position.applyQuaternion(quaternion);
						this.camera.position.copy(position.add(this.target));
						this.camera.lookAt(this.target);
					};
					
					this.dollyIn = function(dollyScale) {
						const position = new THREE.Vector3().subVectors(this.camera.position, this.target);
						position.multiplyScalar(dollyScale);
						this.camera.position.copy(position.add(this.target));
					};
					
					this.dollyOut = function(dollyScale) {
						const position = new THREE.Vector3().subVectors(this.camera.position, this.target);
						position.multiplyScalar(1/dollyScale);
						this.camera.position.copy(position.add(this.target));
					};
					
					this.pan = function(deltaX, deltaY) {
						const offset = new THREE.Vector3();
						const position = this.camera.position;
						offset.copy(position).sub(this.target);
						const targetDistance = offset.length();
						
						// 计算平移量
						const element = scope.domElement;
						const panLeft = -2 * deltaX * targetDistance / element.clientHeight;
						const panUp = 2 * deltaY * targetDistance / element.clientHeight;
						
						// 应用平移
						const v = new THREE.Vector3();
						v.setFromMatrixColumn(camera.matrix, 0); // 获取右方向向量
						v.multiplyScalar(panLeft);
						scope.camera.position.add(v);
						scope.target.add(v);
						
						v.setFromMatrixColumn(camera.matrix, 1); // 获取上方向向量
						v.multiplyScalar(panUp);
						scope.camera.position.add(v);
						scope.target.add(v);
					};
					
					this.update = function() {
						this.camera.lookAt(this.target);
					};
				};
				
				console.log('内置的简易轨道控制器已经被加载');
			}
			
			// 创建轨道控制器实例
			settings.three.controls = new THREE.OrbitControls(settings.three.camera, settings.three.renderer.domElement);
			settings.three.controls.enableDamping = true; // 启用阻尼效果，使控制更平滑
			settings.three.controls.dampingFactor = 0.05; // 设置阻尼系数
			settings.three.controls.enableZoom = true;    // 允许缩放
			settings.three.controls.enablePan = true;     // 允许平移
			settings.three.controls.enableRotate = true;  // 允许旋转
			console.log('轨道控制器初始化成功');
		} catch (error) {
			console.error('初始化轨道控制器出错:', error);
		}
		
		// 添加光源，提供更好的3D可视化效果
		// 添加环境光，提供柔和的全局照明
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		settings.three.scene.add(ambientLight);
		
		// 添加平行光源，模拟太阳光
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(0, 1, 1); // 设置光源位置
		settings.three.scene.add(directionalLight);
		
		// 添加额外的平行光源，从另一个角度提供照明
		const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight2.position.set(1, 0.5, -1); // 设置第二个光源的位置
		settings.three.scene.add(directionalLight2);
		
		// 添加网格辅助（默认显示）
		settings.three.showGrid = true;
		const gridHelper = new THREE.GridHelper(800, 50, 0x888888, 0xcccccc);
		settings.three.gridHelper = gridHelper;
		settings.three.scene.add(gridHelper);
		
		// 创建万花尺元素组
		settings.three.spirographGroup = new THREE.Group();
		settings.three.scene.add(settings.three.spirographGroup);
		
		// 创建新的空曲线用于绘制
		clear3DScene();
		
		// 启动动画循环
		animate3D();
		
		console.log('3D模式初始化完成');
	}
	
	function animate3D() {
		if (!settings.enable3D) return; // Stop animation if 3D mode is disabled
		
		requestAnimationFrame(animate3D);
		
		// 更新轨道控制器
		if (settings.three.controls) {
			settings.three.controls.update();
			
			// 确保拖拽时控制器始终启用
			if (!settings.three.controls.enabled) {
				settings.three.controls.enabled = true;
			}
		}
		
		// 渲染场景
		if (settings.three.renderer && settings.three.scene && settings.three.camera) {
				settings.three.renderer.render(settings.three.scene, settings.three.camera);
		}
	}
	
	function drawCircles3D() {
		// 确保清除现有的圆圈但保留曲线
		// 保存现有的曲线
		let curve = null;
		for (let i = 0; i < settings.three.spirographGroup.children.length; i++) {
			const obj = settings.three.spirographGroup.children[i];
			if (obj === settings.three.line) {
				curve = obj;
				continue; // 保留曲线
			}
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) obj.material.dispose();
			settings.three.spirographGroup.remove(obj);
			i--; // 因为我们删除了一个元素，所以索引需要减一
		}
		
		// 重新添加曲线
		if (curve) {
			settings.three.spirographGroup.add(curve);
		}
		
		// 如果齿轮被设置为隐藏，则不绘制它们
		if (settings.circles === "hide") {
			// 只需渲染场景，不绘制齿轮
			if (settings.three.renderer && settings.three.scene && settings.three.camera) {
				settings.three.renderer.render(settings.three.scene, settings.three.camera);
			}
			return;
		}
		
		// 获取当前绘制点的位置
		const i = settings.i;
		
		// 缩放因子使3D圆圈与2D圆圈大小相似
		const scale3D = 1;
		
		// 定义材质 - 使用更亮的颜色，确保在白色背景上可见
		const circleMaterial = new THREE.MeshBasicMaterial({ 
			color: 0x0088ff, 
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.7
		});
		
		const rotorMaterial = new THREE.MeshBasicMaterial({ 
			color: 0xffaa00, 
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.7
		});
		
		const penMaterial = new THREE.MeshBasicMaterial({ 
			color: new THREE.Color(settings.curveColor), 
			side: THREE.DoubleSide
		});
		
		const lineMaterial = new THREE.LineBasicMaterial({ 
			color: 0x444444,
			transparent: true,
			opacity: 0.7
		});
		
		// 绘制固定圆（固定外圆）- 定子
		const statorRadius = Number(settings.radii[0]) * scale3D;
		const statorGeometry = new THREE.RingGeometry(statorRadius - 1, statorRadius, 64);
		const stator = new THREE.Mesh(statorGeometry, circleMaterial);
		stator.rotation.x = Math.PI / 2; // 使其水平放置
		settings.three.spirographGroup.add(stator);
		
		// 变量初始化 - 与drawCircles函数中相同的逻辑
		let c = 1;
		let thisRad = 0;
		let prevRad = 0;
		let centerRad = 0;
		let thisPitch = 0;
		let prevPitch = 0;
		let prevSpinPitch = 0;
		let prevDrawPitch = 0;
		let lastRotorCenter = new THREE.Vector3(0, 0, 0);
		let finalPenPosition = null;
		
		// 开始绘制转子(rotors)
		// 从中心点开始
		let centerPoint = new THREE.Vector3(0, 0, 0);
		
		while (c < settings.radii.length) {
			// 设置半径，应用缩放
			thisRad = Number(settings.radii[c]) * scale3D;
			prevRad = Number(settings.radii[c - 1]) * scale3D;
			
			// 确定圆的类型和半径
			if (settings.types[c] === "h") {
				// 内旋轮线(hypotrochoid): 圆在内部滚动
				centerRad = prevRad - thisRad;
			} else {
				// 外旋轮线(epitrochoid): 圆在外部滚动
				centerRad = prevRad + thisRad;
			}
			
			// 累积角度，与2D版本相同
			if (c > 1) {
				prevPitch = prevPitch + settings.pitches[c - 2];
				prevSpinPitch = prevSpinPitch + settings.spinPitches[c - 2];
				prevDrawPitch = prevDrawPitch + settings.drawPitches[c - 2];
			} else {
				prevPitch = 0;
				prevSpinPitch = 0;
				prevDrawPitch = 0;
			}
			
			// 设置旋转方向
			const mult = settings.directions[c];
			
			// 设置绘制角度和画笔角度
			const thisPitch = (settings.drawPitches[c - 1] + prevDrawPitch) * mult;
			let penPitch;
			
			if (settings.types[c] === "h") {
				penPitch = (settings.spinPitches[c - 1] + prevSpinPitch) * mult * -1;
			} else {
				penPitch = (settings.spinPitches[c - 1] + prevSpinPitch) * mult;
			}
			
			// 计算转子中心在3D空间中的位置
			const ptCanvas = circlePoint(settings.a, settings.b, centerRad, i * thisPitch);
			const gearCenter = new THREE.Vector3(
				ptCanvas.x - settings.a,
				0, // 保持y=0，让万花尺保持平面
				-(ptCanvas.y - settings.b) // 反转z轴以匹配Three.js坐标系统
			);
			
			// 绘制转子(rotor)齿轮
			const gearGeometry = new THREE.RingGeometry(thisRad - 1, thisRad, 64);
			const gear = new THREE.Mesh(gearGeometry, rotorMaterial);
			gear.rotation.x = Math.PI / 2; // 水平放置
			gear.position.copy(gearCenter);
			settings.three.spirographGroup.add(gear);
			
			// 计算画笔位置
			const penPtCanvas = circlePoint(ptCanvas.x, ptCanvas.y, thisRad, i * penPitch);
			const penPosition = new THREE.Vector3(
				penPtCanvas.x - settings.a,
				0,
				-(penPtCanvas.y - settings.b)
			);
			
			// 画线连接转子中心和画笔位置
			const lineGeometry = new THREE.BufferGeometry().setFromPoints([
				gearCenter,
				penPosition
			]);
			const line = new THREE.Line(lineGeometry, lineMaterial);
			settings.three.spirographGroup.add(line);
			
			// 保存最后转子的信息，用于画笔
			if (c === settings.radii.length - 1) {
				lastRotorCenter = gearCenter.clone();
				finalPenPosition = {
					x: penPtCanvas.x,
					y: penPtCanvas.y
				};
			}
			
			// 更新中心点为当前转子中心，为下一个转子做准备
			centerPoint = gearCenter;
			
			c++;
		}
		
		// 绘制画笔 - 这是绘制曲线的关键点
		if (finalPenPosition) {
			// 创建画笔（小球）
			const penGeometry = new THREE.SphereGeometry(3, 16, 16);
			const pen = new THREE.Mesh(penGeometry, penMaterial);
			pen.position.set(
				finalPenPosition.x - settings.a,
				0,
				-(finalPenPosition.y - settings.b)
			);
			settings.three.spirographGroup.add(pen);
			
			// 保存画笔位置用于绘制曲线
			settings.pen = finalPenPosition;
			
			// 更新曲线点，这是关键部分，确保我们有正确的画笔位置
			if (settings.curvePoints.length < 1) {
				settings.curvePoints.push({
					"x": finalPenPosition.x,
					"y": finalPenPosition.y
				});
				settings.penStart = {
					"x": finalPenPosition.x,
					"y": finalPenPosition.y
				};
			}
			
			// 保持两个点，用于绘制曲线
			settings.curvePoints[0] = settings.curvePoints[1] || settings.curvePoints[0];
			settings.curvePoints[1] = {
				"x": finalPenPosition.x,
				"y": finalPenPosition.y
			};
		}
		
		// 渲染更新后的场景
		if (settings.three.renderer && settings.three.scene && settings.three.camera) {
			settings.three.renderer.render(settings.three.scene, settings.three.camera);
		}
	}
	
	function clear3DScene() {
		// 清除曲线点数组
		settings.three.points = [];
		
		// 移除现有的3D曲线
		if (settings.three.line) {
			if (settings.three.line.geometry) settings.three.line.geometry.dispose();
			if (settings.three.line.material) settings.three.line.material.dispose();
			settings.three.spirographGroup.remove(settings.three.line);
			settings.three.line = null;
		}
		
		// 创建新的空曲线
		const curveGeometry = new THREE.BufferGeometry();
		const curveMaterial = new THREE.LineBasicMaterial({ 
			color: new THREE.Color(settings.curveColor),
			linewidth: Math.max(1, parseFloat(settings.curveWidth)), // 更粗的线条在3D中更容易看到
			transparent: false,
			opacity: 1.0
		});
		settings.three.line = new THREE.Line(curveGeometry, curveMaterial);
		
		// 确保线条始终可见
		settings.three.line.visible = true;
		
		// 添加到场景
		settings.three.spirographGroup.add(settings.three.line);
		
		// 渲染更新后的场景
		if (settings.three.renderer && settings.three.scene && settings.three.camera) {
			settings.three.renderer.render(settings.three.scene, settings.three.camera);
		}
	}
	
	function restart3D() {
		console.log("重新启动3D绘制");
		// 重置绘制参数
		settings.three.points = [];
		settings.i = 0;
		settings.curvePoints = [];
		
		// 清除现有曲线
		clear3DScene();
		
		// 绘制齿轮状态
		drawCircles3D();
		
		// 如果处于绘制模式，启动绘制过程
		if (settings.draw) {
			console.log("恢复绘制...");
			requestAnimationFrame(draw);
		}
	}
	
	// Update window resize handler to support 3D mode
	function handleWindowResize() {
		console.log("窗口大小变化");
		// 更新2D画布
		resizeCanvas();
		
		// 如果在3D模式，更新Three.js组件
		if (settings.enable3D && settings.three.renderer) {
			console.log("调整3D渲染器大小");
			const width = settings.divCanvas.clientWidth - settings.sidebarWidth;
			const height = settings.divCanvasHeight;
			
			if (settings.three.camera) {
				settings.three.camera.aspect = width / height;
				settings.three.camera.updateProjectionMatrix();
			}
			
			if (settings.three.renderer) {
				settings.three.renderer.setSize(width, height);
				settings.three.renderer.render(settings.three.scene, settings.three.camera);
			}
		}
	}
	
	// Override the existing window resize handler with our new one
	window.removeEventListener('resize', resizeCanvas);
	window.addEventListener('resize', handleWindowResize);

	function toggleGridButton() {
		var button = document.createElement("BUTTON");
		button.className = "button";
		button.id = settings.idNames.toggleGrid;
		button.innerHTML = "隐藏网格";
		button.setAttribute("title", "隐藏/显示3D网格");
		settings.sidebarDiv.appendChild(button);
		
		button.addEventListener("click", function() {
			if (settings.three.showGrid) {
				// 隐藏网格
				console.log("隐藏网格");
				settings.three.showGrid = false;
				button.innerHTML = "显示网格";
				if (settings.three.gridHelper) {
					settings.three.gridHelper.visible = false;
				}
			} else {
				// 显示网格
				console.log("显示网格");
				settings.three.showGrid = true;
				button.innerHTML = "隐藏网格";
				if (settings.three.gridHelper) {
					settings.three.gridHelper.visible = true;
				}
			}
			
			// 渲染更新后的场景
			if (settings.three.renderer && settings.three.scene && settings.three.camera) {
				settings.three.renderer.render(settings.three.scene, settings.three.camera);
			}
		});
		
		// 初始状态下隐藏按钮，只在3D模式下显示
		button.style.display = 'none';
		return button;
	}

})(
	//settings object
	{
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
			"git": "git",
			"gitLabel": "gitLabel",
			"gitIcon": "gitIcon",
			"link": "link",
			"linkLabel": "linkLabel",
			"linkIcon": "linkIcon",
			"zoomIn": "zoomIn",
			"zoomInLabel": "zoomInLabel",
			"zoomInIcon": "zoomInIcon",
			"zoomOut": "zoomOut",
			"zoomOutLabel": "zoomOutnLabel",
			"zoomOutIcon": "zoomOutnIcon",
			"angle": "angle",
			"toggle3D": "toggle3D",
			"toggle3DIcon": "toggle3DIcon",
			"toggleGrid": "toggleGrid",
			"toggleGridIcon": "toggleGridIcon",
		},
		"presets": [

			{
				"name": "liner",
				"st": "300",
				"r1": "150h",
				"pen": "150",
				"wd": "1",
				"cl": "#008000",
				"sp": "1",
			},

			{
				"name": "manta",
				"st": "300",
				"r1": "150h",
				"r2": "75h",
				"r3": "37.5e",
				"r4": "18.75e",
				"pen": "18.75",
				"wd": "1",
				"cl": "#2E8B57",
				"sp": "1",
			},

			{
				"name": "classic plus",
				"st": "77",
				"r1": "11e",
				"r2": "72e",
				"pen": "72",
				"wd": ".1",
				"cl": "#2E8B57",
				"sp": "1",
			},

			{
				"name": "lily pad",
				"st": "250",
				"r1": "25h",
				"r2": "66e",
				"r3": "33e",
				"pen": "33",
				"wd": ".2",
				"cl": "#8FBC8F",
				"sp": "1",
			},

			{
				"name": "kaleidoscope",
				"st": "250",
				"r1": "12.5h",
				"r2": "72e",
				"pen": "36",
				"wd": ".05",
				"cl": "#4B0082",
				"sp": "1",
			},

			{
				"name": "tubular",
				"st": "120",
				"r1": "60e",
				"r2": "120h",
				"r3": "22h",
				"pen": "5.5",
				"wd": ".1",
				"cl": "#006400",
				"sp": "1",
			},

			{
				"name": "drop",
				"st": "100",
				"r1": "99e",
				"r2": "66e",
				"r3": "33e",
				"pen": "33",
				"wd": ".2",
				"cl": "#d21d00",
				"sp": "200",
			},

			{
				"name": "habitrail",
				"st": "300",
				"r1": "150h",
				"r2": "125h",
				"r3": "54h",
				"pen": "13.5",
				"wd": ".08",
				"cl": "#000000",
				"sp": "1",
			},

			{
				"name": "pods",
				"st": "250",
				"r1": "66h",
				"r2": "11e",
				"pen": "66",
				"wd": ".2",
				"cl": "#000080",
				"sp": "1",
			},

			{
				"name": "arclight",
				"st": "125",
				"r1": "132e",
				"r2": "66h",
				"r3": "3e",
				"pen": "24",
				"wd": ".1",
				"cl": "#a0631c",
				"sp": "1",
			},

			{
				"name": "the bloom",
				"st": "100",
				"r1": "36e",
				"r2": "100e",
				"pen": "100",
				"wd": ".1",
				"cl": "#000080",
				"sp": "1",
			},

			{
				"name": "emerald",
				"st": "150",
				"r1": "4e",
				"r2": "75e",
				"r3": "25h",
				"pen": "75",
				"wd": ".04",
				"cl": "#007071",
				"sp": "1000",
			},

			{
				"name": "points",
				"st": "75",
				"r1": "205h",
				"r2": "152e",
				"r3": "76h",
				"pen": "76",
				"wd": ".02",
				"cl": "#0000ff",
				"sp": "10",
			},

			{
				"name": "the touch",
				"st": "6.25",
				"r1": "198e",
				"r2": "99h",
				"r3": "9e",
				"pen": "9",
				"wd": ".03",
				"cl": "#800080",
				"sp": "1000",
			},

			{
				"name": "red cloud",
				"st": "332",
				"r1": "207.5h",
				"r2": "20.75h",
				"r3": "77h",
				"pen": "77",
				"wd": ".02",
				"cl": "#ed0707",
				"sp": "1000",
			},


			{
				"name": "wormhole",
				"st": "25",
				"r1": "198h",
				"r2": "66h",
				"r3": "5.5e",
				"pen": "5.5",
				"wd": ".2",
				"cl": "#942193",
				"sp": "1",
			},

			{
				"name": "sails",
				"st": "250",
				"r1": "25h",
				"r2": "66h",
				"r3": "5.5h",
				"pen": "66",
				"wd": ".1",
				"cl": "#ff2600",
				"sp": "1",
			},

			{
				"name": "ouroboros",
				"st": "332",
				"r1": "166h",
				"r2": "20.75h",
				"r3": "77h",
				"pen": "77",
				"wd": ".1",
				"cl": "#008000",
				"sp": "1",
			},

			{
				"name": "true love",
				"st": "250",
				"r1": "99h",
				"r2": "66e",
				"r3": "22h",
				"pen": "33",
				"wd": ".2",
				"cl": "#8B0000",
				"sp": "1",
			},

			{
				"name": "the bug",
				"st": "150",
				"r1": "90e",
				"r2": "45e",
				"r3": "22.5e",
				"r4": "17e",
				"r5": "22.5e",
				"pen": "22.5",
				"wd": ".02",
				"cl": "#945200",
				"sp": "1000",
			},

			{
				"name": "ribbons",
				"st": "332",
				"r1": "207.5h",
				"r2": "20.75h",
				"r3": "38.5e",
				"r4": "19.25h",
				"pen": "19.25",
				"wd": ".04",
				"cl": "#0000ff",
				"sp": "1000",
			},

			{
				"name": "burgess shale",
				"st": "250",
				"r1": "99h",
				"r2": "75h",
				"r3": "50e",
				"r4": "25e",
				"pen": "25",
				"wd": ".01",
				"cl": "#6A5ACD",
				"sp": "1000",
			},

			{
				"name": "amethyst",
				"st": "350",
				"r1": "187h",
				"r2": "66h",
				"r3": "33e",
				"r4": "11h",
				"pen": "5.5",
				"wd": ".05",
				"cl": "#4b0082",
				"sp": "1000",
			},

			{
				"name": "magnets",
				"st": "9",
				"r1": "250e",
				"r2": "180h",
				"r3": "90e",
				"pen": "90",
				"wd": ".05",
				"cl": "#7f7f7f",
				"sp": "1000",
			},

			{
				"name": "sand dollar",
				"st": "250",
				"r1": "25h",
				"r2": "67e",
				"r3": "33e",
				"pen": "33",
				"wd": ".03",
				"cl": "#289528",
				"sp": "1000",
			},

			{
				"name": "super star",
				"st": "250",
				"r1": "90h",
				"r2": "45e",
				"r3": "45e",
				"r4": "22.5h",
				"r5": "17h",
				"pen": "17",
				"wd": ".03",
				"cl": "#011993",
				"sp": "1000",
			},

			{
				"name": "fader",
				"st": "300",
				"r1": "90h",
				"r2": "45e",
				"r3": "30e",
				"r4": "22.5e",
				"r5": "19.3e",
				"pen": "19.3",
				"wd": ".01",
				"cl": "#cc1470",
				"sp": "1000",
			},

			{
				"name": "prince",
				"st": "12.5",
				"r1": "198e",
				"r2": "66h",
				"r3": "11h",
				"r4": "5.5e",
				"pen": "33",
				"wd": ".1",
				"cl": "#942193",
				"sp": "1",
			},

			{
				"name": "art deco",
				"st": "75",
				"r1": "25e",
				"r2": "50e",
				"r3": "100e",
				"r4": "199h",
				"r5": "99.5h",
				"pen": "99.5",
				"wd": ".05",
				"cl": "#033333",
				"sp": "1",
			},

			{
				"name": "mandala",
				"st": "75",
				"r1": "160e",
				"r2": "3h",
				"pen": "48",
				"wd": ".1",
				"cl": "#007071",
				"sp": "1",
			},

			{
				"name": "pufferfish",
				"st": "160",
				"r1": "16h",
				"r2": "77h",
				"r3": "33h",
				"r4": "16.5e",
				"r5": "8.25e",
				"pen": "77",
				"wd": ".1",
				"cl": "#0000FF",
				"sp": "1",
			},

			{
				"name": "sauron",
				"st": "300",
				"r1": "98h",
				"r2": "37.5h",
				"r3": "37.5e",
				"r4": "18.75e",
				"pen": "18.75",
				"wd": ".02",
				"cl": "#8a2e2e",
				"sp": "1000",
			},

			{
				"name": "reverb",
				"st": "9",
				"r1": "250h",
				"r2": "180h",
				"r3": "15h",
				"pen": "15",
				"wd": ".07",
				"cl": "#2a9bb2",
				"sp": "1000",
			},

			{
				"name": "bentley",
				"st": "9",
				"r1": "250e",
				"r2": "180h",
				"r3": "15h",
				"pen": "15",
				"wd": ".06",
				"cl": "#004080",
				"sp": "1000",
			},


		],
		"penColors": [{
			"name": "black",
			"hex": "#000000",
		}, {
			"name": "blue",
			"hex": "#0000FF",
		}, {
			"name": "cornflowerblue",
			"hex": "#6495ED",
		}, {
			"name": "crimson",
			"hex": "#DC143C",
		}, {
			"name": "darkgreen",
			"hex": "#006400",
		}, {
			"name": "darkred",
			"hex": "#8B0000",
		}, {
			"name": "darkseagreen",
			"hex": "#8FBC8F",
		}, {
			"name": "gold",
			"hex": "#FFD700",
		}, {
			"name": "green",
			"hex": "#008000",
		}, {
			"name": "indigo",
			"hex": "#4B0082",
		}, {
			"name": "magenta",
			"hex": "#FF00FF",
		}, {
			"name": "navy",
			"hex": "#000080",
		}, {
			"name": "orange",
			"hex": "#FFA500",
		}, {
			"name": "powderblue",
			"hex": "#B0E0E6",
		}, {
			"name": "purple",
			"hex": "#800080",
		}, {
			"name": "red",
			"hex": "#FF0000",
		}, {
			"name": "seagreen",
			"hex": "#2E8B57",
		}, {
			"name": "slateblue",
			"hex": "#6A5ACD",
		}, {
			"name": "steelblue",
			"hex": "#6A5ACD",
		}, {
			"name": "violet",
			"hex": "#EE82EE",
		}, {
			"name": "yellow",
			"hex": "#FFFF00",
		}],
		"speedSettings": [{
			"name": "slowest",
			"speed": .01,
		}, {
			"name": "slower",
			"speed": .1,
		}, {
			"name": "slow",
			"speed": 1,
		}, {
			"name": "fast",
			"speed": 10,
		}, {
			"name": "faster",
			"speed": 200,
		}, {
			"name": "fastest",
			"speed": 1000,
		},]
	}
);
