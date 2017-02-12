var sys   = require('util');
var http  = require('http');
var url   = require('url');

//require custom dispatcher
var dispatcher = require('./dispatcher.js');


console.log('Strežnik @ http://localhost/');

http.createServer(function (req, res) {
  //wrap calls in a try catch
  //or the node js server will crash upon any code errors
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
  }).listen(80, "localhost", function() {
    //runs when our server is created
    console.log('Server running at http://localhost:80');
  });