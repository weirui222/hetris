const Hex = require('./hex')

module.exports = {
  size: 35,
  vector2Size: {x: 35, y: 35},
  boardOffset: {x: 300, y: 300},

  cubeToAxial: function(x,y,z) {
    return [x, z]
  },

  axialToCube: function(q, r) {
    return [q, -q-r, r]
  },
  axialToPixels: function(q, r) {
    var x = this.size * Math.sqrt(3) * (q + r/2)
    var y = this.size * 3/2 * r
    return [x, y]
  },
  hexToPixels: function(x,y,z) {
    [q, r] = this.cubeToAxial(x, y, z);
    return this.axialToPixels(q, r);
  },
  pixelsToAxial: function(x, y) {
    q = (x * Math.sqrt(3)/3 - y / 3) / this.size;
    r = y * 2/3 / this.size;
    [rq, rr] = this.axialRound(q, r);
    return [rq, rr];
  },
  pixelsToHex: function(x, y) {
    var [q,r] = this.pixelsToAxial(x, y);
    return this.axialToCube(q, r)
  },
  axialRound: function(q, r){
    var [fx, fy, fz] = this.axialToCube(q, r);
    var [x, y, z] = this.cubeRound(fx, fy, fz);
    return this.cubeToAxial(x, y, z);
  },
  cubeRound: function(x, y, z) {
    var rx = Math.round(x)
    var ry = Math.round(y)
    var rz = Math.round(z)

    var x_diff = Math.abs(rx - x)
    var y_diff = Math.abs(ry - y)
    var z_diff = Math.abs(rz - z)

    if(x_diff > y_diff && x_diff > z_diff) {
      rx = -ry-rz;
    } else if(y_diff > z_diff) {
      ry = -rx-rz;
    } else {
      rz = -rx-ry;
    }

    return [rx, ry, rz];
  },
  nearestHexCenterFromPixels: function(pixels) {
    var hex = (new Hex()).fromPixels(pixels);
    return hex.toPixels();
  },
  addVector2: function(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  },
  subVector2: function(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    };
  }
}
