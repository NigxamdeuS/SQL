// Nigxam SQL ロゴを手書き風に一筆ずつ描画（Vivus）
var stroke = new Vivus("mask-draw", {
  start: "manual",
  type: "scenario", // data-start / data-duration で順番に描く
  duration: 220,
  forceRender: false,
  animTimingFunction: Vivus.EASE_OUT,
}, function () {
  // 線描画が終わったら塗りつぶしへ
  $("#mask").attr("class", "done");
  $("#splash").delay(700).fadeOut("slow");
  $("#splash_logo").delay(700).fadeOut("slow");
});

$(window).on("load", function () {
  stroke.play();
});
