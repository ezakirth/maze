import gl from "./Graphics.js";
import input from "./Input.js";
import Maze from "./Maze.js";
import editor from "./Editor.js";

editor.init();

let then = 0;

window.input = input;

let screen = gl.height;
let size = screen / 22;
if (screen > gl.width) screen = gl.width;

let maze = null;

function resize() {
  let height = Math.floor(gl.height / size);
  let width = Math.floor(gl.width / size);

  maze = new Maze(width, height, size);

  window.maze = maze;
  console.log(maze);
}

resize();
window.addEventListener("resize", resize);

export default class Engine {
  constructor() {}

  init() {
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    if (editor.needRebuild) {
      editor.needRebuild = false;
      resize();
    }

    gl.clear();

    if (input.clicked) {
      input.clicked = false;
      let x = Math.floor(input.current.x / size);
      let y = Math.floor(input.current.y / size);

      console.log(maze.tiles[maze.getIndex(x, y)]);
    }
    maze.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}
