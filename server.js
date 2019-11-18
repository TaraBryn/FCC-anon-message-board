'use strict';

var express       = require('express');
var bodyParser    = require('body-parser');
var expect        = require('chai').expect;
var cors          = require('cors');
const MongoClient = require('mongodb').MonogClient;
const helmet      = require('helmet');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use(helmet({
  contentSecurityPolicy: {directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'https://hyperdev.com/', 'https://cdn.gomix.com/', 'http://glitch.com/'],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://code.jquery.com/'],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }}
}))

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(process.env.DB, {useUnifiedTopology: true}, function(err, client){
  
  //Sample front-end
  app.route('/b/:board/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/board.html');
    });
  app.route('/b/:board/:threadid')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/thread.html');
    });

  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });
  
  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
  //Routing for API 
  apiRoutes(app, client.db('anon_msg_board'));
  
})



//For FCC testing purposes
fccTestingRoutes(app);



    


//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
