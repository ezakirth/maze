export default class DoorMaker {
  constructor(maze, allowCornerDoors) {
    this.maze = maze;

    this.allowCornerDoors = allowCornerDoors;

    this.tiles = this.maze.tiles;
    this.width = this.maze.width;
    this.height = this.maze.height;
  }

  addDoors(room) {
    let wantedNbDoors = 2;
    let maxAttempts = 1000;
    let nbAttempts = 0;
    let nbDoors = 0;

    while (nbAttempts < maxAttempts && nbDoors < wantedNbDoors) {
      let doorX = Math.random() < 0.5 ? room.x : room.x + room.width - 1;
      let doorY = Math.random() < 0.5 ? room.y : room.y + room.height - 1;

      if (this.allowCornerDoors) {
        if (Math.random() < 0.5) {
          doorX = room.x + Math.floor(Math.random() * (room.width - 1));
        } else {
          doorY = room.y + Math.floor(Math.random() * (room.height - 1));
        }
      } else {
        if (Math.random() < 0.5) {
          doorX = 1 + room.x + Math.floor(Math.random() * (room.width - 2));
        } else {
          doorY = 1 + room.y + Math.floor(Math.random() * (room.height - 2));
        }
      }

      let door = this.tiles[this.getIndex(doorX, doorY)];

      if (!this.testAddDoor(door, room)) {
        nbAttempts++;
      } else {
        nbDoors++;
        this.maze.doors.push(door);
        room.doors.push(door);
      }
    }
  }

  testAddDoor(door, room) {
    let tile = this.tiles[this.getIndex(door.x, door.y)];
    let top = this.tiles[this.getIndex(door.x, door.y - 1)];
    let right = this.tiles[this.getIndex(door.x + 1, door.y)];
    let bottom = this.tiles[this.getIndex(door.x, door.y + 1)];
    let left = this.tiles[this.getIndex(door.x - 1, door.y)];

    if (
      tile.isDoor ||
      top.isDoor ||
      right.isDoor ||
      bottom.isDoor ||
      left.isDoor
    ) {
      return false;
    }
    tile.isDoor = true;

    // left side of room
    if (door.x == room.x) {
      tile.walls.left = false;
      left.walls.right = false;
    } // right side of room
    else if (door.x == room.x + room.width - 1) {
      tile.walls.right = false;
      right.walls.left = false;
    }
    // top side of room
    else if (door.y == room.y) {
      tile.walls.top = false;
      top.walls.bottom = false;
    }
    // bottom side of room
    else if (door.y == room.y + room.height - 1) {
      tile.walls.bottom = false;
      bottom.walls.top = false;
    }

    return true;
  }

  getIndex(x, y) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return x + this.width * y;

    return -1;
  }
}
