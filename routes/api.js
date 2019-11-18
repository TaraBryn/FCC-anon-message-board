/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app, db) {
  
  app.route('/api/threads/:board')
  .post(function(req, res){
    db.collection('boards')
    .updateOne(
      {board: req.params.board},
      {
      $setOnInsert: {
        board: req.params.board,
        message: req.body.text,
        password: req.body.password
      }
    })
  })
    
  app.route('/api/replies/:board');

};
