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
              reported: false,
              replies: []
            }
          }
        },
        {upsert: true}
      )
      .then(()=>res.redirect('/b/' + board + '/'))
      .catch(err=>res.json(err))
    })
  })
  
  .get(function(req, res){
    var board = req.params.board;
    db.collection('boards').findOne({board},{})
    .then(data => {
      //console.log(data)
      //res.json = 
      var val = data.threads.map(e=>{
        var {_id, created_on, bumped_on, text, replies} = e;
        return {
          _id, 
          created_on, 
          bumped_on, 
          text, 
          replies: replies.slice(2)
        }
      })
      .sort((a,b)=>new Date(a.bumped_on)-new Date(b.bumped_on))
      res.json(val.length > 10 ? val.slice(9) : val);
    })
    .catch(err=>res.json(err))
  })
    
  app.route('/api/replies/:board')
  
  .post(function(req, res){
    var board = req.params.board;
    bcrypt.hash(req.body.delete_password, saltRounds, (err, hash) => {
      db.collection('boards')
      .updateOne(
        {
          board,
          'threads._id': ObjectId(req.body._id)
        },
        {
          $push: {
            'threads.$.replies': {
              _id: new ObjectId(),
              crated_on: new Date(),
              text: req.body.text,
              password: hash,
              reported: false
            }
          },
          $set: {bumped_on: new Date()}
        }
      )
      .then(()=>res.redirect(`/b/${board}/${req.body._id}`))
      .catch(err=>res.json(err))
    })
  })

};
