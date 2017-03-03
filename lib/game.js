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
  {key: "second", bounds: [140, 240, 400, 500]},
  //{key: "third", bounds: [600, 700, 400, 500]},
]

var circleimg =new Image();
circleimg.src="images/circle.png";

$("#rank").hide();

function drawCircle(){
  ctx.save();
  var time = new Date();
  ctx.translate(190,450);
  ctx.rotate(((2 * Math.PI) / 5) * time.getSeconds() + ((2 * Math.PI) / 5000) * time.getMilliseconds());
  ctx.drawImage(circleimg, -75, -75, 150, 150);
  ctx.restore();
}

function drawScore(){
  ctx.font = "50px Arial white";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(score.toString(),170,600);
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

function mousedownOrTouchstart(event){
  mouseCoords = getMousePos(canvas, event);
  isMouseDown = true;
  shapeInHand = whichShapeDidYouPick();
}

document.addEventListener('mousedown', mousedownOrTouchstart);
document.addEventListener('touchstart', mousedownOrTouchstart);

document.getElementById('submit').addEventListener('submit', function(event){
  event.preventDefault();
  data = {
    score: score,
    name: event.target.userName.value
  }
  //console.log('data',data);
  fetch(`/score`, {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    body: JSON.stringify(data)
  }).then((res) => {
      res.json().then(function(json) {
        console.log('res.json()', json);
        for (var i = 0; i < json.length; i++) {
          console.log('json[i].score',json[i].score,'json[i].name',json[i].name);
          document.getElementById("score" + i).innerText = json[i].score;
          document.getElementById("name" + i).innerText = json[i].name;
        }
        return json;
      });
  });
  $("#rank").show();
})

function mouseupOrTouchend(event){
  pixels = hexHelper.subVector2(mouseCoords, hexHelper.boardOffset);
  if(shapeInHand && board.validDrop(pixels, shapeInHand)){
    let hexes = board.addTilesFromShape(pixels, shapeInHand);
    //console.log('hexes', hexes);
    hexes.forEach(hex => {
      score += board.removeThreePlus(hex);
      //console.log('totlescore',score);
    });

    if (board.movesRemaining(Shape.allPossible)) {
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
};

document.addEventListener('mouseup', mouseupOrTouchend);
document.addEventListener('touchend', mouseupOrTouchend);

function mousemoveOrTouchmove(event){
  if(isMouseDown){
    mouseCoords = getMousePos(canvas, event);
  }
}

document.addEventListener('mousemove', mousemoveOrTouchmove);
document.addEventListener('touchmove', mousemoveOrTouchmove);

$(document).ready(function(event) {
  $('#gameStartModal').modal('show');
});

document.getElementById('restartButton').addEventListener('click', function(event){
  shapesInWaiting.second = new Shape(ctx, 2);
  board.clear();
  score = 0;
  $("#rank").hide();
})

function clickOr(event){
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
}

document.addEventListener('click', clickOr);


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
