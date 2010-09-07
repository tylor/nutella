/**
 * Using a couple of nice libraries:
 * - http://github.com/technoweenie/twitter-node
 * - http://github.com/miksago/node-websocket-server
 *
 * With some guidance from: http://jeffkreeftmeijer.com/2010/experimenting-with-node-js/
 */
var TwitterNode = require('./twitter-node/lib/twitter-node').TwitterNode,
    ws          = require('./node-websocket-server/lib/ws'),
    server      = ws.createServer(),
    sys         = require('sys');

var twit = new TwitterNode({
  user: 'twitterUsername', // Yes, use your Twitter account.
  password: 'twitterPassword',
  track: ['bieber'], // Comma delimited list.
  // locations: [-122.75, 36.8, -121.75, 37.8] // tweets in SF
});

// Listen for errors.
twit.addListener('error', function(error) {
  console.log(error.message);
});

twit
  .addListener('tweet', function(tweet) {
    sys.puts("@" + tweet.user.screen_name + ": " + tweet.text);
    server.broadcast(JSON.stringify({
      'screen_name': tweet.user.screen_name,
      'profile_image_url': tweet.user.profile_image_url,
      'text': tweet.text,
      'id': tweet.id,
      'created_at': tweet.created_at,
      'tweet': tweet,
    }));
  })
  .addListener('limit', function(limit) {
    sys.puts("LIMIT: " + sys.inspect(limit));
    server.close();
  })
  .addListener('delete', function(del) {
    sys.puts("DELETE: " + sys.inspect(del));
    server.close();
  })
  .addListener('end', function(resp) {
    sys.puts("wave goodbye... " + resp.statusCode);
    server.close();
  })
  .stream();

// Start websocket server.
server.listen(8000, "127.0.0.1");