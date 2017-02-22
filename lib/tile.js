var images = [
  "images/tile_hex_1.svg",
  "images/tile_hex_2.svg",
  "images/tile_hex_3.svg",
  "images/tile_hex_4.svg",
  "images/tile_hex_5.svg",
  "images/tile_hex_6.svg",
  "images/tile_hex_7.svg"
]

function Tile(value, context) {
  this.value = value;
  this.image = new Image();
  this.image.src = images[value - 1]; // values is in [1, 7]
  this._context = context;
}

module.exports = Tile;
