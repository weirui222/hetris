const _ = require('underscore');

const Board = require('./board');
const Shape = require('./shape');
const hexHelper = require('./hex-helper');

const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');

var score = 0;

var isMouseDown = false;
var board = new Board(ctx);

var shapeInHand = null;
var shapeFrom = "second";

var mouseCoords = {};

var shapesInWaiting = {
  // first: new Shape(ctx),
  second: new Shape(ctx, 2),
  // third: new Shape(ctx)
}

const shapesInWaitingBoxes = [
  //{key: "first", bounds: [600, 700, 100, 200]},
  {key: "second", bounds: [600, 700, 250, 350]},
  //{key: "third", bounds: [600, 700, 400, 500]},
]

function drawShapesInWaiting() {
  //shapesInWaiting.first.draw(650, 150, .8);
  shapesInWaiting.second.draw(650, 300, .8);
  //shapesInWaiting.third.draw(650, 450, .8);
}

function drawShapeInHand(){
  if(isMouseDown && shapeInHand) {
    shapeInHand.draw(mouseCoords.x, mouseCoords.y);
  }
}

function whichShapeDidYouPick() {
  return shapesInWaiting.second;
}


// board.addRandomTiles();

requestAnimationFrame(function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.draw();
  board.drawPotentialSlots(mouseCoords, shapeInHand);
  drawShapesInWaiting();
  drawShapeInHand();
  requestAnimationFrame(gameLoop);
});

document.addEventListener('mousedown', function(event){
  mouseCoords = getMousePos(canvas, event);
  isMouseDown = true;
  shapeInHand = whichShapeDidYouPick();
})

document.addEventListener('mouseup', function(event){
  pixels = hexHelper.subVector2(mouseCoords, hexHelper.boardOffset);
  if(shapeInHand && board.validDrop(pixels, shapeInHand)){
    let hexes = board.addTilesFromShape(pixels, shapeInHand);
    //console.log('hexes', hexes);
    hexes.forEach(hex => {
      score += board.removeThreePlus(hex);
      console.log('totlescore',score);
    });
    document.getElementById("score-value").innerText = score;
    if (board.hasEmptySlots()) {
      while (true) {
        shapesInWaiting[shapeFrom] = new Shape(ctx, board.getMaxValue());
        if(board.movesRemaining(_.values(shapesInWaiting))){
          break;
        }
      }
    } else {
      document.getElementById("finalscore").innerText = score;
      $('#gameOverModal').modal('show');
    }
  }
  isMouseDown = false;
  shapeInHand = null;
})

document.addEventListener('mousemove', function(event){
  if(isMouseDown){
    mouseCoords = getMousePos(canvas, event);
  }
})
$(document).ready(function(event) {
  $('#gameStartModal').modal('show');
});
document.getElementById('restartButton').addEventListener('click', function(event){
  shapesInWaiting.second = new Shape(ctx, 2);
  board.clear();
  score = 0;
  document.getElementById("score-value").innerText = score;
})

document.addEventListener('click', function(event){
  let bounds = shapesInWaitingBoxes[0].bounds;
  if (mouseCoords.x > bounds[0] && mouseCoords.x < bounds[1] && mouseCoords.y
      > bounds[2] && mouseCoords.y < bounds[3]) {
    let shape = shapesInWaiting[shapeFrom];
    if (shape.tiles.length === 2 &&
      shape.tiles[0].tile.value !== shape.tiles[1].tile.value) {
      let temp = shape.tiles[0].tile;
      shape.tiles[0].tile = shape.tiles[1].tile;
      shape.tiles[1].tile = temp;
    }
  }
})

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
