var fs = require('fs');
var Psql = require('./psql');

this.dispatch = function(req, res) {

  //some private methods
  var serverError = function(code, content) {
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.end(content);
    content = null;
  }

  var renderHtml = function(content) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content, 'utf-8');
    content = null;
  }

  var renderJS = function(content) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(content, 'utf-8');
    content = null;
  }

  var renderAjax = function(content) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(content, 'utf-8');
    content = null;
  }

var renderCSS = function(content) {
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.end(content, 'utf-8');
    content = null;
  }


  var parts = req.url.split('/');
  //console.log(parts);


  if (req.url == "/") {
    fs.readFile('../../docs/index.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 1');
        serverError(500);
      } else {
        renderHtml(content);
      }
    });

  } else if (parts[1]=='sql') {
    try {

      var webVnos = parts[2];
      var psql = new Psql();


      var content = psql.poizvedba(webVnos);
      console.log(content);
      //console.log(content);
      renderAjax(content);
      //console.log('pošiljam ajax');

    } catch (err) {
      //handle errors gracefully
      console.log('pošiljam 500 - 2');
      serverError(500);
    }
    
  } else {
    //var prvi   = parts[0];
    var drugi = req.url;

    //console.log(drugi);

    fs.readFile('../../docs'+drugi, function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 3 ../../docs'+drugi);
        serverError(500);
      } else {
        //console.log('pošiljam js');
        renderCSS(content);
      }
    });
  }
}