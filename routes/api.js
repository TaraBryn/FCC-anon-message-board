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
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      db.collection('boards').updateOne(
        {board: req.params.board},
        {
          $setOnInsert: {
            board: req.params.board,
            messgae: req.body.text,
            password: hash,
            threads: []
          },
          $push: {
            threads: {
              
            }
          }
        }
      )
    })
  })
    
  app.route('/api/replies/:board');

};
