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
const bcrypt = require('bcrypt');

const saltRounds = 12;

module.exports = function (app, db) {
  
  app.route('/api/threads/:board')
  .post(function(req, res){
    var board = req.params.board;
    console.log(req.body);
    bcrypt.hash(req.body.delete_password, saltRounds, (err, hash) => {
      db.collection('boards').updateOne(
        {board},
        {
          $setOnInsert: {
            board
          },
          $push: {
            threads: {
              _id: new ObjectId(),
              text: req.body.text,
              password: hash,
              replies: []
            }
          }
        },
        {upsert: true}
      )
      .then(()=>app.redirect('/b/' + board))
      .catch(err=>console.log(err))
    })
  })
    
  app.route('/api/replies/:board');

};
