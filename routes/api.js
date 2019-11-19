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
    bcrypt.hash(req.body.delete_password, saltRounds, (err, hash) => {
      db.collection('boards').updateOne(
        {board},
        {
          $setOnInsert: {
            board,
            created_on: new Date()
          },
          $push: {
            threads: {
              _id: new ObjectId(),
              created_on: new Date(),
              bumped_on: new Date(),
              text: req.body.text,
              password: hash,
              replies: []
            }
          }
        },
        {upsert: true}
      )
      .then(()=>res.redirect('/b/' + board))
      .catch(err=>res.json(err))
    })
  })
    
  app.route('/api/replies/:board')
  
  .post(function(req, res){
    var board = req.params.board;
    bcrypt.hash(req.body.delete_password, saltRounds, (err, hash) => {
      db.collection('boards')
      .updateOne(
        {board},
        {
          $push: {
            threads: {
              _id: new ObjectId(),
              text: req.body.text,
              password: hash
            }
          }
        }
      )
    })
  })

};
