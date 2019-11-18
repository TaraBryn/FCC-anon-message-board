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
    db.updateOne
  })
    
  app.route('/api/replies/:board');

};
