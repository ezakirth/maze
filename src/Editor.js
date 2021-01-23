const editor = {
  nbRooms: 2,
  rebuildAll: false,
  rebuildMaze: false,
  init: function () {
    let nbRooms = document.querySelector("#nbRooms");
    let rebuildAll = document.querySelector("#rebuildAll");
    let rebuildMaze = document.querySelector("#rebuildMaze");

    let data = JSON.parse(window.localStorage.getItem("map"));
    if (data && data.rooms) nbRooms.value = data.rooms.length;
    else nbRooms.value = this.nbRooms;

    nbRooms.addEventListener("input", (e) => {
      editor.nbRooms = e.target.value;
      this.needRebuild = true;
      this.rebuildAll = true;
    });

    rebuildAll.addEventListener("click", (e) => {
      this.needRebuild = true;
      this.rebuildAll = true;
    });

    rebuildMaze.addEventListener("click", (e) => {
      this.needRebuild = true;
      this.rebuildMaze = true;
    });
  },
};

export default editor;
