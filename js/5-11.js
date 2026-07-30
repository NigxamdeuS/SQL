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

    // ライトは少し濃く、ダークは少し透過を上げて馴染ませる
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
