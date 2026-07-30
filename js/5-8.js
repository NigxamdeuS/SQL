particlesJS("particles-js", {
  particles: {
    number: {
      value: 125, // この数値を変更すると紙吹雪の数が増減できる
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
      ], // 紙吹雪の色
    },
    shape: {
      type: "polygon", // 形状は polygon を指定
      stroke: {
        width: 0,
      },
      polygon: {
        nb_sides: 5, // 多角形の角の数
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
      random: true, // サイズをランダムに
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
      speed: 10, // この数値を小さくするとゆっくりな動きになる
      direction: "bottom", // 下に向かって落ちる
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
