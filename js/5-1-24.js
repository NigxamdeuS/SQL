/* 丸拡大ナビ（5-1-24）の開閉。ボタンの×アニメは 5-2-7.js が担当 */
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
