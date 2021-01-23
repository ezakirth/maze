import { v3 } from "../node_modules/twgl.js/dist/4.x/twgl-full.module.js";

const input = {
  active: false,
  clicked: false,
  current: { x: 0, y: 0 },
  previous: { x: 0, y: 0 },

  keyPressed: [],

  init: function () {
    window.addEventListener("contextmenu", (event) => event.preventDefault());

    window.addEventListener(
      "mousemove",
      (e) => {
        input.current.x = e.clientX;
        input.current.y = e.clientY;

        /*  if (input.active) {
          input.yaw += (input.current.x - input.previous.x) / 3;
          input.pitch += (input.current.y - input.previous.y) / 3;

          if (input.pitch > 90) input.pitch = 90;
          if (input.pitch < -90) input.pitch = -90;
        }*/

        input.previous.x = input.current.x;
        input.previous.y = input.current.y;
      },
      false
    );
    window.addEventListener("click", (e) => (input.clicked = true), false);
    window.addEventListener("mouseup", (e) => (input.active = false), false);
    window.addEventListener(
      "mousedown",
      (e) => {
        if (e.button === 2) input.active = true;
      },
      false
    );

    window.addEventListener(
      "keydown",
      (e) => (input.keyPressed[e.code] = true),
      false
    );
    window.addEventListener(
      "keyup",
      (e) => (input.keyPressed[e.code] = false),
      false
    );
  },
};

export default input;
