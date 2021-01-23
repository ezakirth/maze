import DoorMaker from "./DoorMaker";

export default class RoomMaker {
  constructor(maze) {
    this.maze = maze;

    let allowCornerDoors = false;
    this.doorMaker = new DoorMaker(maze, this.allowCornerDoors);

    this.tiles = this.maze.tiles;
    this.width = this.maze.width;
    this.height = this.maze.height;
  }

  addRooms(wantedNbRooms = 1) {
    let maxAttempts = 1000;
    let nbAttempts = 0;
    let nbRooms = 0;

    while (nbAttempts < maxAttempts && nbRooms < wantedNbRooms) {
      let room = {
        width: 5 + Math.floor((Math.random() * this.width) / 5),
        height: 5 + Math.floor((Math.random() * this.height) / 5),
        x: 0,
        y: 0,
        id: "room_" + nbRooms,
        doors: [],
      };

      room.x = 1 + Math.floor(Math.random() * (this.width - room.width - 1));
      room.y = 1 + Math.floor(Math.random() * (this.height - room.height - 1));

      if (!this.testAddRoom(room)) {
        nbAttempts++;
      } else {
        nbRooms++;
        this.maze.rooms.push(room);
      }
    }
  }

  testAddRoom(room) {
    // on test si la room rentre (avec un espace de chaque côté)
    for (let x = room.x - 1; x < room.x + room.width + 1; x++) {
      for (let y = room.y - 1; y < room.y + room.height + 1; y++) {
        let tile = this.tiles[this.getIndex(x, y)];
        if (!tile || tile.roomId) return false;
      }
    }

    // on ne met la room que si elle rentre
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        let tile = this.tiles[this.getIndex(x, y)];

        tile.walls.top = false;
        tile.walls.right = false;
        tile.walls.bottom = false;
        tile.walls.left = false;

        if (x === room.x) tile.walls.left = true;
        if (y === room.y) tile.walls.top = true;
        if (x === room.x + room.width - 1) tile.walls.right = true;
        if (y === room.y + room.height - 1) tile.walls.bottom = true;

        if (
          tile.walls.top ||
          tile.walls.right ||
          tile.walls.bottom ||
          tile.walls.left
        ) {
          tile.isRoomBorder = true;
        }

        tile.roomId = room.id;
        tile.visited = true;
        this.maze.nbVisited++;
      }
    }

    this.doorMaker.addDoors(room);

    return true;
  }

  getIndex(x, y) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height)
      return x + this.width * y;

    return -1;
  }
}
