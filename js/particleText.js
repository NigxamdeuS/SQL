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
			    // 密度が高いほど点を少し小さくして重なりすぎを防ぐ
			    var density = options.density ? Number(options.density) : 200;
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
				// size: 大きいほど文字が小さくなる（デフォルト10）
				var fSize = options.size ? Number(options.size) : 10;
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

			    // density: 大きいほどドットが増える（デフォルト200）
			    var density = options.density ? Number(options.density) : 200;
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
