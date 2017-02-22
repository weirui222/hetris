const _ = require('underscore');

const Slot = require('./slot');
const Tile = require('./tile');
const Hex = require('./hex');
const hexHelper = require('./hex-helper');

const neighborOffsets = [[1,-1,0],[-1,1,0],[0,1,-1],[0,-1,1],[-1,0,1],[1,0,-1]];

function Board(context){
  this.boardSize = 3;
  this.slots = [];

  for(var x = -this.boardSize; x <= this.boardSize; x++) {
    for(var y = -this.boardSize; y <= this.boardSize; y++) {
      for(var z = -this.boardSize; z <= this.boardSize; z++) {
        if(x+y+z == 0) {
          var slot = new Slot(new Hex(x, y, z), context);
          this.slots.push(slot);
        }
      }
    }
  }
}

Board.prototype.addRandomTiles = function() {
  this.slots.forEach(function(slot){
    if(Math.random() > .8)
      slot.tile = new Tile("../images/tile_hex_1.svg");
  });
}

Board.prototype.drawPotentialSlots = function(mouseCoords, shape) {
  if(!shape) return;
  pixels = hexHelper.subVector2(mouseCoords, hexHelper.boardOffset);
  if(!this.validDrop(pixels, shape)) return;

  var center = hexHelper.nearestHexCenterFromPixels(pixels);
  center = hexHelper.addVector2(center, hexHelper.boardOffset);
  shape.draw(center.x, center.y);
}

Board.prototype.validDrop = function(pixels, shape) {
  if(!shape) return;

  var hex = (new Hex()).fromPixels(pixels);
  return this.validShapeAtCoords(hex, shape);
}

Board.prototype.coordsToSlot = function(x, y, z) {
  var matchCoords = [x, y, z];
  return this.slots.reduce(function(slot, slotToCheck) {
    currentCoords = [slotToCheck.hex.x, slotToCheck.hex.y, slotToCheck.hex.z];
    return _.isEqual(matchCoords, currentCoords) ? slotToCheck : slot;
  }, false);
}

Board.prototype.addTilesFromShape = function(pixels, shape) {
  if(!shape) return;
  if(!this.validDrop(pixels, shape)) return;

  var hex = (new Hex()).fromPixels(pixels);
  var board = this;
  var hexes = shape.tiles.map(function(tileOpts){
    var tile = new Tile(tileOpts.tile.value);
    var hexInBoard = hex.add(tileOpts.hex);
    board.hexToSlot(hexInBoard).tile = tile;
    return hexInBoard;
  });

  return hexes;
}

Board.prototype.removeThreePlus = function(hex) {
  console.log('removing at hex', hex);

  let initialSlot = this.hexToSlot(hex);
  if (initialSlot.tile === undefined) {
    return;
  }

  let queue = [];
  queue.push(hex);
  let sameSlots = [];
  let visited = {};
  while (queue.length > 0) {
    let current = queue.shift();
    let key = current.x + '-' + current.y + '-' + current.z;
    if (visited[key]) {
      continue;
    }
    visited[key] = true;
    let slot = this.hexToSlot(current);
    if (slot && slot.tile && slot.tile.value === initialSlot.tile.value) {
      sameSlots.push(slot);
      neighborOffsets.forEach(offset => {
        let neighborHex = current.add(new Hex(offset[0],offset[1],offset[2]));
        queue.push(neighborHex);
      });
    }
  }
  console.log('sameSlots',sameSlots);
  let score = 0;
  if (sameSlots.length >= 3) {
    for (let i = 1; i < sameSlots.length; i++) {
      sameSlots[i].tile = undefined;
    }
    let value = sameSlots[0].tile.value;
    if (value !== 7) {
      sameSlots[0].tile = new Tile(value + 1);
    }else {
      sameSlots[0].tile = undefined;
      neighborOffsets.forEach(offset => {
        let neighborHex = sameSlots[0].hex.add(new Hex(offset[0],offset[1],offset[2]));
        let slot = this.hexToSlot(neighborHex);
        if (slot) {
          slot.tile = undefined;
        }
      });
    }
    score = value * sameSlots.length;
  }
  return score;
}

Board.prototype.removeFullLines = function() {
  //get full rows
  var board = this;
  var fullRows = ["x", "y", "z"].reduce(function(allRows, axis) {
    for(var n = -board.boardSize; n <= board.boardSize; n++) {
      allRows.push(board.getRow(axis, n));
    }
    return allRows;
  }, []).filter(function(row){
    return _.every(row, function(slot) {
      return slot.tile != undefined;
    });
  });

  var multiplier = 1;
  var score = 0;
  fullRows.forEach(function(fullRow){
    fullRow.forEach(function(slot) {
      slot.tile = undefined;
    });
    score += fullRow.length * 500 * multiplier;
    multiplier++;
  })

  return score;
}

Board.prototype.validShapeAtCoords = function(hex, shape) {
  if(!shape) return;
  var hexesToCheck = shape.tiles.map(function(tile) {
    return hex.add(tile.hex);
  })

  board = this;
  return _.every(hexesToCheck, function(hex) {
    slot = board.hexToSlot(hex);
    return slot && slot.tile == undefined;
  });
}

Board.prototype.hexToSlot = function(hex) {
  return board.coordsToSlot(hex.x, hex.y, hex.z);
}

Board.prototype.getRow = function(axis, rowNumber) {
  return this.slots.filter(function(slot){
    return slot.hex[axis] == rowNumber;
  })
}

Board.prototype.movesRemaining = function(shapes) {
  board = this;
  return _.any(this.slots, function(slot) {
    return _.any(shapes, function(shape) {
      return board.validShapeAtCoords(slot.hex, shape);
    });
  });
}

Board.prototype.draw = function(){
  this.slots.forEach(function(slot){
    slot.draw();
  })
}

module.exports = Board;
