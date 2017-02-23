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
  {key: "second", bounds: [115, 375, 375, 525]},
  //{key: "third", bounds: [600, 700, 400, 500]},
]

var circleimg =new Image();
circleimg.src="images/circle.png";

function drawCircle(){
  ctx.save();
  var time = new Date();
  ctx.translate(190,450);
  ctx.rotate(((2 * Math.PI) / 5) * time.getSeconds() + ((2 * Math.PI) / 5000) * time.getMilliseconds());
  ctx.drawImage(circleimg, -75, -75, 150, 150);
  ctx.restore();
}

function drawScore(){
  ctx.font = "40px Arial";
  ctx.fillText(score.toString(),170,570);
}

function drawShapesInWaiting() {
  if (shapesInWaiting.second.shapeId === 1) {
    shapesInWaiting.second.draw(190, 450);
  } else if(shapesInWaiting.second.shapeId === 2){
    shapesInWaiting.second.draw(172.5, 467.5);
  } else if(shapesInWaiting.second.shapeId === 3){
    shapesInWaiting.second.draw(172.5, 432.5);
  } else {
    shapesInWaiting.second.draw(165, 450);
  }
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
  if (shapeInHand) {
    drawShapeInHand();
  } else {
    drawShapesInWaiting();
  }
  drawCircle();
  drawScore();
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
