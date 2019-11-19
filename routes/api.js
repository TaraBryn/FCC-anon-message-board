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
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      db.collection('boards').updateOne(
        {board},
        {
          $setOnInsert: {
            board,
            threads: []
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
      .then(()=>console.log('test'))
      .catch(err=>console.log(err))
    })
  })
    
  app.route('/api/replies/:board');

};
