import { vec2 } from "gl-matrix";
class Graphics {
  constructor() {
    this.init();
  }

  init() {
    let body = document.querySelector("body");

    this.canvas = document.createElement("canvas");
    body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    window.addEventListener("resize", () => {
      this.resize();
    });

    this.resize();

    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.lineWidth = 2;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  point(x, y, radius = 1) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }
}

const gl = new Graphics();

export default gl;
