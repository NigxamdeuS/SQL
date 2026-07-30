/* ホーム：パーティクル文字・波・紙吹雪 */
(function( $ ) {
  $.fn.particleText = function(options) {


  			var target = "";
  			if(this[0].className){
  				target = "." + this[0].className;
  			}
  			if(this[0].id){
  				target = "#" + this[0].id;
  			}

			var canvas = document.querySelector(target);
			var ctx = canvas.getContext("2d");
			var ww = canvas.width = canvas.clientWidth;
			var wh = canvas.height = canvas.clientHeight;
  			var text = "";
  			var easing = 0.09;

  			if(options.speed){
  				if(options.speed == "middle"){
  					easing = 0.07;
  				}
  				else if(options.speed == "slow"){
  					easing = 0.04;
  				}
  				else if(options.speed == "high"){
  					easing = 0.09;
  				}
  			}
  			if(options.text){
  				text = options.text;
  			} else {
  				text = options;
  			}
			var colors = ["#F54064","#F5D940", "#18EBF2"];
			function resolveColors(){
				if (typeof options.colors === "function") {
					return options.colors();
				}
				if (options.colors) {
					return options.colors;
				}
				return colors;
			}
			colors = resolveColors();

			var flg = false;
			if (text.indexOf("<br>") != -1) {
				flg = true;
			}


			var particles = [],num = 0;

			function Particle(ax,ay){
			    this.x =  Math.random()*ww;
			    this.y =  Math.random()*wh;
			    this.goal = {
			        x : ax,
			        y: ay
			    };
			    // 蟇・ｺｦ縺碁ｫ倥＞縺ｻ縺ｩ轤ｹ繧貞ｰ代＠蟆上＆縺上＠縺ｦ驥阪↑繧翫☆縺弱ｒ髦ｲ縺・			    var density = options.density ? Number(options.density) : 200;
			    if (!density || density < 50) density = 200;
			    this.r = Math.max(0.6, (canvas.clientWidth / 2) * (0.003 * (200 / density)));
			    this.color = colors[Math.floor(Math.random() * colors.length)];
			}


	
			Particle.prototype.render = function() {
				this.x += (this.goal.x - this.x) * easing;
			        this.y += (this.goal.y - this.y) * easing;
				ctx.fillStyle = this.color;
			    ctx.beginPath();
				ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
			    ctx.fill();

			}

			function applyParticleColors(){
				colors = resolveColors();
				for (var i = 0; i < particles.length; i++) {
					particles[i].color = colors[Math.floor(Math.random() * colors.length)];
				}
			}

			window.addEventListener("pg-theme-change", applyParticleColors);


		
			function initScene(){

				var ww = canvas.width = canvas.clientWidth;
				var wh = canvas.height = canvas.clientHeight;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				colors = resolveColors();
				// size: 螟ｧ縺阪＞縺ｻ縺ｩ譁・ｭ励′蟆上＆縺上↑繧具ｼ医ョ繝輔か繝ｫ繝・0・・				var fSize = options.size ? Number(options.size) : 10;
				if (!fSize || fSize < 4) fSize = 10;
				var fontPx = Math.max(24, Math.round(ww / fSize));
				ctx.font = "bold " + fontPx + "px sans-serif";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";


				if(!flg){
					drawOneText();
				} else {
					drawManyLineText();
				}


				function drawOneText(){
				    ctx.fillText(text, ww / 2, wh / 2, ww * 0.9);
				}


				function drawManyLineText(){
				    var arrayStrig = text.split("<br>");
					var lineCount = arrayStrig.length;
					var lineGap = fontPx * 1.25;
					var blockHeight = lineGap * (lineCount - 1);
					var startY = (wh / 2) - (blockHeight / 2);

					for (var i = 0; i < lineCount; i++) {
						ctx.fillText(arrayStrig[i], ww / 2, startY + (lineGap * i), ww * 0.88);
					}
				}
			    
			 	
			    var data  = ctx.getImageData(0, 0, ww, wh).data;
			    ctx.clearRect(0, 0, canvas.width, canvas.height);
			    ctx.globalCompositeOperation = "source-over";

			    
			    particles = [];

			    // density: 螟ｧ縺阪＞縺ｻ縺ｩ繝峨ャ繝医′蠅励∴繧具ｼ医ョ繝輔か繝ｫ繝・00・・			    var density = options.density ? Number(options.density) : 200;
			    if (!density || density < 50) density = 200;
			    var step = Math.max(1, Math.round(ww / density));

			    for(var i=0; i<ww; i+=step){
			        for(var j=0;j<wh; j+=step){
			            if(data[ ((i + j*ww)*4) + 3] > 100){
			                particles.push(new Particle(i,j));
			            }
			        }
			    }

			    num = particles.length;
			    
			}


			function render(a) {
				
			    requestAnimationFrame(render);
			    
			    ctx.clearRect(0, 0, canvas.width, canvas.height);

			    for (var i = 0; i < num; i++) {
			        particles[i].render();
			    }
			};

			window.addEventListener("resize", initScene);

			initScene();
			
			requestAnimationFrame(render);
			  		
	};
})(jQuery);
(function () {

  var started = false;



  function isDarkTheme() {

    return document.documentElement.getAttribute("data-theme") === "dark";

  }



  function particleColors() {

    // 荳｡繝・・繝槭〒繧ｳ繝ｳ繝医Λ繧ｹ繝医ｒ遒ｺ菫晢ｼ医げ繝ｬ繝ｼ豺ｷ蝨ｨ繧偵ｄ繧√ｋ・・

    return isDarkTheme() ? ["#ffffff"] : ["#000000"];

  }



  function startParticle() {

    var el = document.getElementById("particle");

    if (!el || typeof jQuery === "undefined" || !jQuery.fn.particleText) return;

    if (el.clientWidth < 10 || el.clientHeight < 10) return;



    if (!started) {

      started = true;

      $("#particle").particleText({

        text: "Nigxam SQL",

        colors: particleColors,

        speed: "high",

        size: 15,

        density: 520,

      });

    } else {

      window.dispatchEvent(new Event("resize"));

    }

  }



  window.startParticleHome = startParticle;



  $(window).on("load", function () {

    setTimeout(startParticle, 3500);

  });

})();

var unit = 100,
    canvasList,
    info = {},
    colorList;

function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark";
}

function waveColors() {
    var styles = getComputedStyle(document.documentElement);
    var c1 = styles.getPropertyValue("--wave-1").trim() || "#5b7fc4";
    var c2 = styles.getPropertyValue("--wave-2").trim() || "#93b4e6";
    var c3 = styles.getPropertyValue("--wave-3").trim() || "#3f63a8";
    return [c1, c2, c3];
}

function applyWaveColors() {
    if (!colorList || !colorList.length) return;
    colorList[0] = waveColors();
}

function init() {
    info.seconds = 0;
    info.t = 0;
    canvasList = [];
    colorList = [];
    canvasList.push(document.getElementById("waveCanvas"));
    colorList.push(waveColors());
    for (var canvasIndex in canvasList) {
        var canvas = canvasList[canvasIndex];
        if (!canvas) continue;
        canvas.width = document.documentElement.clientWidth;
        canvas.height = 180;
        canvas.contextCache = canvas.getContext("2d");
    }
    update();
}

function update() {
    for (var canvasIndex in canvasList) {
        var canvas = canvasList[canvasIndex];
        if (!canvas) continue;
        draw(canvas, colorList[canvasIndex]);
    }
    info.seconds = info.seconds + 0.014;
    info.t = info.seconds * Math.PI;
    setTimeout(update, 35);
}

function draw(canvas, color) {
    var context = canvas.contextCache;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 繝ｩ繧､繝医・蟆代＠豼・￥縲√ム繝ｼ繧ｯ縺ｯ蟆代＠騾城℃繧剃ｸ翫￡縺ｦ鬥ｴ譟薙∪縺帙ｋ
    var a = isDarkTheme() ? [0.45, 0.35, 0.22] : [0.42, 0.32, 0.18];
    drawWave(canvas, color[0], a[0], 3, 0);
    drawWave(canvas, color[1], a[1], 2, 250);
    drawWave(canvas, color[2], a[2], 1.6, 100);
}

function drawWave(canvas, color, alpha, zoom, delay) {
    var context = canvas.contextCache;
    context.fillStyle = color;
    context.globalAlpha = alpha;
    context.beginPath();
    drawSine(canvas, info.t / 0.5, zoom, delay);
    context.lineTo(canvas.width + 10, canvas.height);
    context.lineTo(0, canvas.height);
    context.closePath();
    context.fill();
}

function drawSine(canvas, t, zoom, delay) {
    var xAxis = Math.floor(canvas.height / 2);
    var yAxis = 0;
    var context = canvas.contextCache;
    var x = t;
    var y = Math.sin(x) / zoom;
    context.moveTo(yAxis, unit * y + xAxis);

    for (var i = yAxis; i <= canvas.width + 10; i += 10) {
        x = t + (-yAxis + i) / unit / zoom;
        y = Math.sin(x - delay) / 3;
        context.lineTo(i, unit * y + xAxis);
    }
}

function resizeWaveCanvas() {
    if (!canvasList) return;
    for (var canvasIndex in canvasList) {
        var canvas = canvasList[canvasIndex];
        if (!canvas) continue;
        canvas.width = document.documentElement.clientWidth;
        canvas.height = 180;
    }
}

window.addEventListener("resize", resizeWaveCanvas);
window.addEventListener("pg-theme-change", applyWaveColors);

init();
particlesJS("particles-js", {
  particles: {
    number: {
      value: 125, // 縺薙・謨ｰ蛟､繧貞､画峩縺吶ｋ縺ｨ邏吝聖髮ｪ縺ｮ謨ｰ縺悟｢玲ｸ帙〒縺阪ｋ
      density: {
        enable: false,
        value_area: 400,
      },
    },
    color: {
      value: [
        "#EA5532",
        "#F6AD3C",
        "#FFF33F",
        "#00A95F",
        "#00ADA9",
        "#00AFEC",
        "#4D4398",
        "#E85298",
      ], // 邏吝聖髮ｪ縺ｮ濶ｲ
    },
    shape: {
      type: "polygon", // 蠖｢迥ｶ縺ｯ polygon 繧呈欠螳・
      stroke: {
        width: 0,
      },
      polygon: {
        nb_sides: 5, // 螟夊ｧ貞ｽ｢縺ｮ隗偵・謨ｰ
      },
    },
    opacity: {
      value: 1,
      random: false,
      anim: {
        enable: true,
        speed: 20,
        opacity_min: 0,
        sync: false,
      },
    },
    size: {
      value: 5.305992965476349,
      random: true, // 繧ｵ繧､繧ｺ繧偵Λ繝ｳ繝繝縺ｫ
      anim: {
        enable: true,
        speed: 1.345709068776642,
        size_min: 0.8,
        sync: false,
      },
    },
    line_linked: {
      enable: false,
    },
    move: {
      enable: true,
      speed: 10, // 縺薙・謨ｰ蛟､繧貞ｰ上＆縺上☆繧九→繧・▲縺上ｊ縺ｪ蜍輔″縺ｫ縺ｪ繧・
      direction: "bottom", // 荳九↓蜷代°縺｣縺ｦ關ｽ縺｡繧・
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false,
      },
      onclick: {
        enable: false,
      },
      resize: true,
    },
  },
  retina_detect: true,
});
