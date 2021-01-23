import gl from "./Graphics";

export default class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.visited = false;

    this.roomId = null;
    this.isDoor = false;
    this.isRoomBorder = false;

    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };
  }

  draw() {
    let x = this.x * this.size;
    let y = this.y * this.size;

    if (this.walls.top) {
      gl.line(x, y, x + this.size, y);
    }
    if (this.walls.right) {
      gl.line(x + this.size, y, x + this.size, y + this.size);
    }
    if (this.walls.bottom) {
      gl.line(x + this.size, y + this.size, x, y + this.size);
    }
    if (this.walls.left) {
      gl.line(x, y + this.size, x, y);
    }

    //   if (this.isPath || this.roomId) this.fill("rgba(0, 0, 255, 0.5)");
    //   if (this.roomId) this.fill("rgba(128, 128, 255, .5)");

    if (this.walkable) this.fill("rgba(128, 128, 255, .5)");
  }

  fill(fillStyle) {
    let x = this.x * this.size;
    let y = this.y * this.size;
    gl.ctx.fillStyle = fillStyle;
    gl.ctx.fillRect(x, y, this.size, this.size);
  }
}
