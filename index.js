var express = require("express");
var path = require('path');
var fs = require('fs');
var bodyParser = require("body-parser");
var db = require("./models");
var port = 8000;

// app variables
var app = express();
// set/use statements

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

app.get('/test', function(req, res) {
  res.send(true);
});

app.post('/score', function(req, res) {
  //console.log('req',req);
  db.score.create({
    name: req.body.name,
    score: req.body.score
  }).then(function() {
    db.score.findAll({ limit: 10, order: '"score" DESC' }).then(function(data) {
      res.send(data);
    });
  });
});

//console.log("http://localhost:" + port);
app.listen(process.env.PORT || port);
