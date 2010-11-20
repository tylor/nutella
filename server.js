var sys         = require('sys')
  , app         = require('express').createServer()
  , io          = require('socket.io')
  , TwitterNode = require('twitter-node').TwitterNode
  ;

// Get MongoDB ready.
var Db          = require('mongodb').Db
  , Connection  = require('mongodb').Connection
  , Server      = require('mongodb').Server
  , BSON        = require('mongodb').BSONNative
  ;

var host        = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port        = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var db          = new Db('bieber', new Server(host, port, {}), {native_parser:true});

// Homepage.
app.get('/', function(req, res){
  res.render('index.ejs');
});

// Take host port if we can.
app.listen(process.env.PORT || 3000);

// Get connected to Twitter.
var twit = new TwitterNode(
  { user: 'twitterUsername'
  , password: 'twitterPassword'
  , track: ['nutella']
  }
);

// Connect socket.io to express.
var socket = io.listen(app);

// Respond to socket requests.
socket.on('connection', function(client){
  // Dragons.
});

db.open(function(err, db) {
  db.collection('tweets', function(err, collection) {
    // Listen for new tweets and broadcast to socket.
    twit
      .addListener('tweet', function(tweet) {
        // Add to mongodb.
        collection.insert(tweet);
        // Send out new Tweets to everyone connected.
        socket.broadcast(tweet);
      })
      .stream(); // And start streaming.

    // Set up some Twitter stream debugging niceties.
    twit
      .addListener('end', function(resp) {
        console.log("Twitter waves goodbye... " + resp.statusCode);
        if (resp.statusCode == 401) {
          console.log("You probably haven't entered your Twitter credentials properly.");
        }
      })
      .addListener('error', function(error) {
        console.log('Twit error: ' + error.message);
      });
  });
});
