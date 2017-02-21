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

  // } else if (parts[1]=='sql') {
  //     try {

  //       // var webVnos = parts[2];
  //       // var rezul = "";
  //       //Pregledamo za ČŽŠ %C4%8D %C5%BE %C5%A1 - RegEx pa zato, da poišče vse, ne samo prvega
  //       re = new RegExp("%C5%A1", 'g');
  //       webVnos = webVnos.replace(re, 'š');
  //       re = new RegExp("%C5%BE", 'g');
  //       webVnos = webVnos.replace(re, 'ž');
  //       re = new RegExp("%C4%8D", 'g');
  //       webVnos = webVnos.replace(re, 'č');
  //       //console.log(webVnos);
        
  //       Psql.Cenik(webVnos, kljukicaCena, function(rezultatQ) {
  //         //rezul = rezultatQ;
  //         //console.log(rezultatQ);
  //         renderAjax(rezultatQ);

  //       });


  //     } catch (err) {
  //       //handle errors gracefully
  //       console.log('pošiljam 500 - 2 - sql');
  //       serverError(500);
  //     }
  //   } else if (parts[1]=='projekti') {
  //       try {

  //         // var webVnos = parts[2];
  //         Psql.Projekti(function(rezultatQ) {
  //           //rezul = rezultatQ;
  //           //console.log(rezultatQ);
  //           renderAjax(rezultatQ);

  //         });


  //       } catch (err) {
  //         //handle errors gracefully
  //         console.log('pošiljam 500 - 2 - projekti');
  //         serverError(500);
  //   }
    
  // } else if (parts[1]=='projekt') {
  //       try {

  //         // var webVnos = parts[2];
  //         // var rezul = "";
  //         //Pregledamo za ČŽŠ %C4%8D %C5%BE %C5%A1 - RegEx pa zato, da poišče vse, ne samo prvega
  //         re = new RegExp("%C5%A1", 'g');
  //         webVnos = webVnos.replace(re, 'š');
  //         re = new RegExp("%C5%BE", 'g');
  //         webVnos = webVnos.replace(re, 'ž');
  //         re = new RegExp("%C4%8D", 'g');
  //         webVnos = webVnos.replace(re, 'č');
  //         re = new RegExp("%20", 'g');
  //         webVnos = webVnos.replace(re, ' ');
  //         console.log(webVnos);
  //         Psql.Projekt(webVnos, function(rezultatQ) {
  //           //rezul = rezultatQ;
  //           // console.log(rezultatQ);
  //           renderAjax(rezultatQ);
  //         });

  //         } catch (err) {
  //           //handle errors gracefully
  //           console.log('pošiljam 500 - 2 - projekt');
  //           serverError(500);
  //     }
    
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
        //console.log('pošiljam js');
        renderCSS(content);
      }
    });
  }
};

io.sockets.on('connection', function (socket) {
            socket.on('sql', function (data) { //-------------cenik sql
              // console.log (data);
              var vrstic = 0;
              Psql.Cenik(data.vpisanaVrednost, data.distinctCena, function(rezultatQ) {
                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);
                  // console.log(vrstic);
                  vrstic = 0;
                }
                else {
                  socket.emit('vrnjeno', rezultatQ);
                  vrstic += 1;
                }
                rezultatQ = '';
              });
              // socket.disconnect(true);
            });

            socket.on('end', function() {
              // console.log('zakljuceno');
              socket.emit('end');
            });

            socket.on('projekti', function (data) {//-------------projekti sql
              // console.log (data);
              // var vrstic = 0;
              Psql.Projekti(function(rezultatQ) {
                console.log (rezultatQ);
                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);
                  // console.log(vrstic);
                  // vrstic = 0;
                }
                else {
                  socket.emit('vrnjenoProjekti', rezultatQ);
                  // vrstic += 1;
                }
                rezultatQ = '';
              });
              // socket.disconnect(true);
            });

            socket.on('projekt', function (data) {//-------------projekti sql
              // console.log (data);
              // var vrstic = 0;
              Psql.Projekt(data.poizvedba, function(rezultatQ) {
                // console.log (rezultatQ);
                if (rezultatQ == 'konec') {
                  socket.emit('zadnjaVrstica', rezultatQ);
                  // console.log(vrstic);
                  // vrstic = 0;
                }
                else {
                  socket.emit('vrnjenoProjekt', rezultatQ);
                  // vrstic += 1;
                }
                rezultatQ = '';
              });
              // socket.disconnect(true);
            });
        });