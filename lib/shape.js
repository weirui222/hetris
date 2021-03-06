const _ = require('underscore');
const Tile = require('./tile');
const hexHelper = require('./hex-helper');
const Hex = require('./hex')

var image_width = (hexHelper.size * 2) - 2;

const possibleShapes = [
  // {
  //   shapeId: 1,
  //   coords: [ [0,0,0] ],
  // },
  {
    shapeId: 2,
    coords: [
      [1,0,-1],
      [0,0,0],
    ],
  },
  {
    shapeId: 3,
    coords: [
      [0,-1,1],
      [0,0,0],
    ],
  },
  {
    shapeId: 4,
    coords: [
      [0,0,0],
      [1,-1,0],
    ],
  },
]

function Shape(context, maxValue, desiredShape){
  this._context = context;
  let shape = desiredShape;
  if (!shape) {
    shape = _.sample(possibleShapes);
  }
  this.shapeId = shape.shapeId;
  this.tiles = this.makeTilesFromCoords(shape, maxValue);
}

Shape.prototype.makeTilesFromCoords = function(shapeOpts, maxValue) {
  return shapeOpts.coords.map(function(coords) {
    var [x,y,z] = coords;
    //console.log('board.slots',board.slots);
    return {
      hex: new Hex(x, y, z),
      tile: new Tile(_.random(1, maxValue))
    };
  });
}

Shape.prototype.draw = function(xOffset, yOffset, scale = 1) {
  var ctx = this._context;
  this.tiles.forEach(function(tileOpts) {
    // var [x,y] = hexHelper.hexToPixels(tileOpts.x, tileOpts.y, tileOpts.z).map(n => n * scale);
    pixels = tileOpts.hex.toPixels();

    pixels.x = pixels.x * scale + xOffset - hexHelper.size;
    pixels.y = pixels.y * scale + yOffset - hexHelper.size;

    img = tileOpts.tile.image;
    ctx.drawImage(img, pixels.x, pixels.y, image_width * scale, image_width * scale);
  })
}

Shape.allPossible = possibleShapes.map(s => {
  return new Shape(null, 1, s);
});

module.exports = Shape;
