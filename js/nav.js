/* ナビ開閉 + ハンバーガー×アニメ */
/* 荳ｸ諡｡螟ｧ繝翫ン・・-1-24・峨・髢矩哩縲ゅ・繧ｿ繝ｳ縺ｮﾃ励い繝九Γ縺ｯ 5-2-7.js 縺梧球蠖・*/
$(function () {
  function closeNav() {
    $(".openbtn").removeClass("active");
    $("#g-nav").removeClass("panelactive");
    $(".circle-bg").removeClass("circleactive");
  }

  $(".openbtn").on("click keydown", function (e) {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.type === "keydown") {
      e.preventDefault();
      $(this).toggleClass("active");
    }
    $("#g-nav").toggleClass("panelactive");
    $(".circle-bg").toggleClass("circleactive");
  });

  $("#g-nav a").click(function (e) {
    e.preventDefault();

    var mode = $(this).data("mode");
    if (mode && typeof window.switchMemoMode === "function") {
      window.switchMemoMode(String(mode));
    }

    closeNav();
  });
});
$(".openbtn").click(function () {
    $(this).toggleClass('active');
});
