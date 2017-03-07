var fs = require('fs');
var Psql = require('./psql');
var io = require('socket.io')(8888);
//var psql = new Psql();

this.dispatch = function(req, res) {

  //some private methods
  var serverError = function(code, content) {
    res.writeHead(code, {'Content-Type': 'text/plain'});
    res.end(content);
    content = null;
  };

  var renderHtml = function(content) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderFavi = function() {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    // content = null;
  };

  var renderJS = function(content) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderAjax = function(content) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(content, 'utf-8');
    content = null;
  };

  var renderCSS = function(content) {
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.end(content, 'utf-8');
    content = null;
  };


  var parts = req.url.split('/');
  var webVnos = parts[2];
  var kljukicaCena = parts[3];
  var re;
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

  } else if (parts[1]=='favicon.ico') { //to je zato, da se znebimo opozorila v konzoli o missing favicon.ico
        try {
          renderFavi();
        
        } catch (err) {
          //handle errors gracefully
          console.log('pošiljam 500 - 3 - favicon');
          serverError(500);
      }
    
  } else {

    var drugi = req.url;

    fs.readFile('app'+drugi, function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 4 ../../docs'+drugi);

        serverError(500);
      } else {
        renderCSS(content);
      }
    });
  }
};

io.sockets.on('connection', function (socket) {
            socket.on('sql', function (data) { //-------------cenik sql
              console.log ('nekaj dobim ' + data.vpisanaVrednostSQL);
              // var socketPripravljen = 1;
              var vrstic = 0;
              Psql.Cenik(data.vpisanaVrednostSQL, data.distinctCena, function(rezultatQ) {
                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);
                  // socketPripravljen=1;
                  // console.log(vrstic);
                  vrstic = 0;
                }
                else {
                  // if (socketPripravljen == 1) {
                  //   socketPripravljen=0;
                    socket.emit('vrnjeno', rezultatQ);
                    vrstic += 1;
                  // } else {
                    

                  // }
                }
                rezultatQ = '';
              });
            });

            socket.on('end', function() {
              socket.emit('end');
            });

            socket.on('projekti', function (data) {//-------------projekti sql
              Psql.Projekti(function(rezultatQ) {
                // console.log (rezultatQ);
                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);
                }
                else {
                  socket.emit('vrnjenoProjekti', rezultatQ);
                }
                rezultatQ = '';
              });
            });

            socket.on('projekt', function (data) {//-------------projekt sql

              Psql.Projekt(data.poizvedba, function(rezultatQ) {

                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);

                }
                else {
                  socket.emit('vrnjenoProjekt', rezultatQ);
                }
                rezultatQ = '';
              });
              // socket.disconnect(true);
            });
        });