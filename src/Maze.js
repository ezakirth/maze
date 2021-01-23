import Tile from "./Tile";
import gl from "./Graphics";
import editor from "./Editor.js";

import RoomMaker from "./RoomMaker";

export default class Maze {
  constructor(width = 10, height = 10, tileSize = 32) {
    this.tileSize = tileSize;
    this.width = width;
    this.height = height;
    this.nbVisited = 0;
    this.nbTiles = this.width * this.height;
    this.stack = [];

    let saveName = "map";

    if (editor.rebuildAll) {
      this.createNew(saveName);
      editor.rebuildAll = false;
    } else {
      if (editor.rebuildMaze) {
        console.log("rebuilding");
        this.load("map_rooms");
        this.buildMaze();
        editor.rebuildMaze = false;
      } else {
        this.load(saveName);
      }
    }

    this.paths = {};

    this.nbIterations = 0;
    for (let door of this.doors) {
      this.origin = door;

      for (let tile of this.tiles) {
        tile.isChecked = false;
      }

      this.buildPath(door, []);
    }

    this.markPath();

    this.cleanup();

    let startTile = this.tiles[this.getIndex(Math.floor(this.rooms[0].x + this.rooms[0].width / 2), Math.floor(this.rooms[0].y + this.rooms[0].height / 2))];

    this.testMaze(startTile);

    console.log(this.paths);

    console.log(this.nbIterations);
  }

  init() {
    this.tiles = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let index = x + y * this.width;
        this.tiles[index] = new Tile(x, y, this.tileSize);
      }
    }
  }

  getIndex(x, y) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) return x + this.width * y;

    return -1;
  }

  getTileNeighbour(tile) {
    let neighbours = [];

    let top = this.tiles[this.getIndex(tile.x, tile.y - 1)];
    let right = this.tiles[this.getIndex(tile.x + 1, tile.y)];
    let bottom = this.tiles[this.getIndex(tile.x, tile.y + 1)];
    let left = this.tiles[this.getIndex(tile.x - 1, tile.y)];

    if (top && !top.visited) {
      neighbours.push(top);
    }
    if (right && !right.visited) {
      neighbours.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbours.push(bottom);
    }
    if (left && !left.visited) {
      neighbours.push(left);
    }

    return neighbours;
  }

  buildMaze() {
    this.current = this.tiles[0];

    while (this.nbVisited < this.nbTiles) {
      let neighbours = this.getTileNeighbour(this.current);
      let neighbour = neighbours[Math.floor(Math.random() * neighbours.length)];
      if (neighbour) {
        this.stack.push(this.current);

        this.removeWalls(this.current, neighbour);

        this.current = neighbour;
        this.current.visited = true;
        this.nbVisited++;
      } else {
        this.current = this.stack.pop();
      }
    }
  }

  removeWalls(current, neighbour) {
    if (current.x - neighbour.x === 1) {
      // neighbour à gauche
      current.walls.left = false;
      neighbour.walls.right = false;
      return;
    }
    if (current.x - neighbour.x === -1) {
      // neighbour à droite
      current.walls.right = false;
      neighbour.walls.left = false;
      return;
    }

    if (current.y - neighbour.y === 1) {
      // neighbour en haut
      current.walls.top = false;
      neighbour.walls.bottom = false;
      return;
    }
    if (current.y - neighbour.y === -1) {
      //neighbour en bas
      current.walls.bottom = false;
      neighbour.walls.top = false;
      return;
    }
  }

  buildPath(tile, path) {
    if (!tile) return;
    if (tile.isChecked) return;
    if (tile.roomId && !tile.isDoor) return;
    if (tile.isDoor && tile != this.origin && tile.roomId == this.origin.roomId) return;

    let top = this.tiles[this.getIndex(tile.x, tile.y - 1)];
    let right = this.tiles[this.getIndex(tile.x + 1, tile.y)];
    let bottom = this.tiles[this.getIndex(tile.x, tile.y + 1)];
    let left = this.tiles[this.getIndex(tile.x - 1, tile.y)];

    tile.isChecked = true;
    path.push(tile);

    if (tile.isDoor && this.origin != tile && tile.roomId != this.origin.roomId) {
      let start = path[0].roomId;
      let finish = path[path.length - 1].roomId;

      if (this.paths[start] === undefined) {
        this.paths[start] = {};
      }
      if (this.paths[start][finish] === undefined) {
        this.paths[start][finish] = path;
      } else {
        if (path.length < this.paths[start][finish].length) {
          this.paths[start][finish] = path;
        }
      }

      return;
    }

    if (!tile.walls.top) this.buildPath(top, [...path]);
    if (!tile.walls.right) this.buildPath(right, [...path]);
    if (!tile.walls.bottom) this.buildPath(bottom, [...path]);
    if (!tile.walls.left) this.buildPath(left, [...path]);

    this.nbIterations++;

    return;
  }

  markPath() {
    let roomsOrigin = Object.keys(this.paths);
    let origin = roomsOrigin[0];
    let paths = [];
    let traversed = {};

    for (let cnt = 0; cnt < roomsOrigin.length - 1; cnt++) {
      let roomsDestination = Object.keys(this.paths[origin]);

      let shortest = null;
      for (let destination of roomsDestination) {
        let path = this.paths[origin][destination];

        if (!traversed[destination]) {
          if (!shortest || path.length < shortest.path.length) {
            let alternative = this.paths[destination][origin];
            shortest = {
              origin: origin,
              destination: destination,
              path: alternative.length < path.length ? alternative : path,
            };
          }
        }
      }

      console.log(shortest.origin, shortest.destination, shortest.path.length);
      traversed[origin] = true;
      origin = shortest.destination;
      paths.push(shortest.path);
    }

    for (let list of paths) {
      for (let path of list) {
        let tile = this.tiles[this.getIndex(path.x, path.y)];
        tile.isPath = true;
      }
    }
  }

  cleanup() {
    // on supprime les portes bloquées et on prépare les bordures des rooms
    for (let tile of this.tiles) {
      if (tile.isDoor && !tile.isPath) {
        tile.isDoor = false;
      }

      if (tile.isRoomBorder) {
        tile.isRoomBorder = false;
        tile.roomId = null;
      }
    }

    for (let tile of this.tiles) {
      let top = this.tiles[this.getIndex(tile.x, tile.y - 1)];
      let right = this.tiles[this.getIndex(tile.x + 1, tile.y)];
      let bottom = this.tiles[this.getIndex(tile.x, tile.y + 1)];
      let left = this.tiles[this.getIndex(tile.x - 1, tile.y)];

      // on déplace les portes de l'ancienne bordure vers l'interieur de la pièce
      if (tile.isDoor && !tile.moved) {
        if (top.roomId && !bottom.roomId) {
          top.moved = true;
          top.isDoor = true;
          tile.isDoor = false;
        }

        if (right.roomId && !left.roomId) {
          right.moved = true;
          right.isDoor = true;
          tile.isDoor = false;
        }
        if (bottom.roomId && !top.roomId) {
          bottom.moved = true;
          bottom.isDoor = true;
          tile.isDoor = false;
        }

        if (left.roomId && !right.roomId) {
          left.moved = true;
          left.isDoor = true;
          tile.isDoor = false;
        }
      }

      // on reconstruit les murs autour des "paths"
      if (!(tile.isPath || tile.roomId)) {
        tile.walls.top = false;
        tile.walls.right = false;
        tile.walls.bottom = false;
        tile.walls.left = false;

        if (top && (top.isPath || top.roomId)) {
          top.walls.bottom = true;
          tile.walls.top = true;
        }

        if (right && (right.isPath || right.roomId)) {
          right.walls.left = true;
          tile.walls.right = true;
        }

        if (bottom && (bottom.isPath || bottom.roomId)) {
          bottom.walls.top = true;
          tile.walls.bottom = true;
        }

        if (left && (left.isPath || left.roomId)) {
          left.walls.right = true;
          tile.walls.left = true;
        }
      }
    }
  }

  testMaze(tile) {
    if (!tile) return;
    if (!(tile.isPath || tile.roomId)) return;
    if (tile.walkable) return;

    let top = this.tiles[this.getIndex(tile.x, tile.y - 1)];
    let right = this.tiles[this.getIndex(tile.x + 1, tile.y)];
    let bottom = this.tiles[this.getIndex(tile.x, tile.y + 1)];
    let left = this.tiles[this.getIndex(tile.x - 1, tile.y)];

    tile.walkable = true;

    if (!tile.walls.top) this.testMaze(top);
    if (!tile.walls.right) this.testMaze(right);
    if (!tile.walls.bottom) this.testMaze(bottom);
    if (!tile.walls.left) this.testMaze(left);

    return;
  }

  draw() {
    gl.ctx.lineWidth = 3;

    for (let tile of this.tiles) {
      let x = tile.x * tile.size;
      let y = tile.y * tile.size;

      gl.ctx.strokeStyle = "rgba(255, 255, 255, .5)";

      if (tile.walls.top) {
        gl.line(x, y, x + tile.size, y);
      }
      if (tile.walls.right) {
        gl.line(x + tile.size, y, x + tile.size, y + tile.size);
      }
      if (tile.walls.bottom) {
        gl.line(x + tile.size, y + tile.size, x, y + tile.size);
      }
      if (tile.walls.left) {
        gl.line(x, y + tile.size, x, y);
      }

      if (tile.walkable) {
        gl.ctx.fillStyle = "rgba(64, 64, 64, .5)";
        gl.ctx.fillRect(x, y, tile.size, tile.size);
      }

      if (tile.roomId) {
        gl.ctx.fillStyle = "rgba(255, 0, 0, .1)";
        gl.ctx.fillRect(x, y, tile.size, tile.size);
        gl.ctx.fillStyle = "rgba(255, 255, 255, .8)";
        gl.ctx.fillText(tile.roomId.split("_")[1], x + tile.size / 2 - 6, y + tile.size / 2 + 6, tile.size);
      }
      if (tile.isDoor) {
        gl.ctx.fillStyle = "rgba(255, 255, 0, .1)";
        gl.ctx.fillRect(x, y, tile.size, tile.size);
      }

      if (tile.isRoomBorder) {
        gl.ctx.fillStyle = "rgba(0, 255, 0, .2)";
        gl.ctx.fillRect(x, y, tile.size, tile.size);
      }

      if (tile.moved) {
        gl.ctx.fillStyle = "rgba(0, 255, 255, .1)";
        gl.ctx.fillRect(x, y, tile.size, tile.size);
      }
    }
  }

  createNew(saveName) {
    this.init();
    this.rooms = [];
    this.doors = [];

    let roomMaker = new RoomMaker(this);
    roomMaker.addRooms(editor.nbRooms);
    this.save("map_rooms");
    this.buildMaze();
    this.save(saveName);
  }

  save(saveName) {
    window.localStorage.setItem(saveName, JSON.stringify(this));
  }

  load(saveName) {
    let data = JSON.parse(window.localStorage.getItem(saveName));
    if (data) {
      this.tiles = data.tiles;
      this.doors = data.doors;
      this.rooms = data.rooms;
      this.nbVisited = data.nbVisited;
      this.tileSize = data.tileSize;
      this.width = data.width;
      this.height = data.height;
      this.nbTiles = data.nbTiles;
    } else {
      this.createNew(saveName);
    }
  }
}
