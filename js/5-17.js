(function () {
  var started = false;

  function isDarkTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function particleColors() {
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
