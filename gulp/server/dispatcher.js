var fs = require('fs');
var Psql = require('./psql');
//var psql = new Psql();

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
  // console.log(parts);


  if (req.url == "/") {
    fs.readFile('app/index.html', function(error, content) {
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
        // var rezul = "";
        //Pregledamo za ČŽŠ %C4%8D %C5%BE %C5%A1 - RegEx pa zato, da poišče vse, ne samo prvega
        var re = new RegExp("%C5%A1", 'g');
        webVnos = webVnos.replace(re, 'š');
        var re = new RegExp("%C5%BE", 'g');
        webVnos = webVnos.replace(re, 'ž');
        var re = new RegExp("%C4%8D", 'g');
        webVnos = webVnos.replace(re, 'č');
        //console.log(webVnos);
        Psql.Cenik(webVnos, function(rezultatQ) {
          //rezul = rezultatQ;
          //console.log(rezultatQ);
          renderAjax(rezultatQ);

        });


      } catch (err) {
        //handle errors gracefully
        console.log('pošiljam 500 - 2 - sql');
        serverError(500);
      }
    } else if (parts[1]=='projekti') {
        try {

          // var webVnos = parts[2];
          Psql.Projekti(function(rezultatQ) {
            //rezul = rezultatQ;
            //console.log(rezultatQ);
            renderAjax(rezultatQ);

          });


        } catch (err) {
          //handle errors gracefully
          console.log('pošiljam 500 - 2 - projekti');
          serverError(500);
    }
    
  } else if (parts[1]=='projekt') {
        try {

          var webVnos = parts[2];
          // var rezul = "";
          //Pregledamo za ČŽŠ %C4%8D %C5%BE %C5%A1 - RegEx pa zato, da poišče vse, ne samo prvega
          var re = new RegExp("%C5%A1", 'g');
          webVnos = webVnos.replace(re, 'š');
          var re = new RegExp("%C5%BE", 'g');
          webVnos = webVnos.replace(re, 'ž');
          var re = new RegExp("%C4%8D", 'g');
          webVnos = webVnos.replace(re, 'č');
          var re = new RegExp("%20", 'g');
          webVnos = webVnos.replace(re, ' ');
          console.log(webVnos);
          Psql.Projekt(webVnos, function(rezultatQ) {
            //rezul = rezultatQ;
            // console.log(rezultatQ);
            renderAjax(rezultatQ);
          });

          } catch (err) {
            //handle errors gracefully
            console.log('pošiljam 500 - 2 - projekt');
            serverError(500);
      }
    
  } else {

    var drugi = req.url;

    fs.readFile('app'+drugi, function(error, content) {
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