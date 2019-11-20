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
      var val = data.threads.map(e=>{
        var {_id, created_on, bumped_on, text, replies} = e;
        var replycount = replies.length;
        replies = replies.sort((a,b)=>b.created_on-a.created_on)
        if (replies.length > 3) replies.splice(3);
        return {_id, created_on, bumped_on, text, replycount, replies}
      })
      .sort((a,b)=>b.bumped_on-a.bumped_on)
      if (val.length > 10) val.splice(9);
      res.json(val);
    })
    .catch(err=>res.json(err))
  })
  
  .delete(function(req, res){
    var board = req.params.board,
        _id = ObjectId(req.body.thread_id),
        password = req.body.delete_password;
    db.collection('boards')
    .findOne({board, 'threads._id': _id})
    .then(data=>{
      bcrypt.compare(password, data.threads[0].password, function(err, compRes){
        if (err) return res.json(err);
        if (!compRes) return res.send('incorrect password');
        db.collection('boards')
        .updateOne({board}, {$pull: {threads: {_id}}})
        .then(res.send('success'))
        .catch(err=>res.json(err))
      })
    })
    .catch(err=>res.json(err))
  })
    
  app.route('/api/replies/:board')
  
  .post(function(req, res){
    var board = req.params.board,
        _id = req.body.thread_id,
        text = req.body.text,
        password = req.body.delete_password,
        filter = {board, 'threads._id': ObjectId(_id)};
    bcrypt.hash(password, saltRounds, (err, hash) => {
      db.collection('boards')
      .bulkWrite(
        [
          {
            updateOne: {
              filter,
              update: {
                $push: {
                  'threads.$.replies': {
                    _id: new ObjectId(),
                    created_on: new Date(),
                    text,
                    password: hash,
                    reported: false
                  }
                }
              }
            }
          },
          {
            updateOne: {
              filter,
              update: {$set: {'threads.$.bumped_on':new Date()}}
            }
          }
        ]
      )
      .then(()=>res.redirect(`/b/${board}/${_id}`))
      .catch(err=>res.json(err))
    })
  })
  
  .get(function(req, res){
    var board = req.params.board;
    db.collection('boards')
    .findOne({board, 'threads._id': ObjectId(req.query.thread_id)})
    .then(data=>{
      res.json(data.threads.map(e=>{
        var {_id, created_on, bumped_on, text, replies} = e,
            replycount = replies.length;
        return {_id, created_on, bumped_on, text, replycount, replies}
      })[0])
    })
    .catch(err=>res.json(err))
  })
  
  .delete(function(req, res){
    var board = req.params.board,
        password = req.body.delete_password,
        thread_id = ObjectId(req.body.thread_id),
        reply_id = ObjectId(req.body.reply_id),
        filter = {board, 'threads._id': thread_id, 'threads.replies._id': reply_id};
    console.log(filter)
    db.collection('boards').findOne(filter)
    .then(data=>{
      bcrypt.compare(password, data.threads[0].replies[0].password, function(err, compRes){
        if (err) return res.json(err);
        if (!compRes) return res.send('incorrect password');
        db.collection('boards')
        .updateOne(
          filter,
          {$set: {'threads.$.replies.$.text': '[deleted]'}}
        )
        .then(()=>res.send('success'))
        .catch(err=>res.json(err))
      })
    })
    .catch(err=>res.json(err));
  })

};
