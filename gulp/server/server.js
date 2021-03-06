var sys   = require('util');
var http  = require('http');
var url   = require('url');
var auth = require('http-auth');


var basic = auth.basic({
    realm: "riko",
    file: __dirname + "/.passwd"
});

//require custom dispatcher
var dispatcher = require('./dispatcher.js');


console.log('Strežnik @ http://localhost/');

http.createServer(basic, function (req, res) {
  try {
    //pipe some details to the node console
    console.log('Incoming Request from: ' +
                 req.connection.remoteAddress +
                ' for href: ' + url.parse(req.url).href
    );
    //console.log(req);


  //dispatch our request
  dispatcher.dispatch(req, res);

  } catch (err) {
      //handle errors gracefully
      sys.puts(err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }).listen(80, "192.168.112.200", function() {
    //runs when our server is created
    console.log('Server running at http://localhost:80');
  });

