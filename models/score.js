'use strict';
module.exports = function(sequelize, DataTypes) {
  var score = sequelize.define('score', {
    name: DataTypes.STRING,
    score: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return score;
};