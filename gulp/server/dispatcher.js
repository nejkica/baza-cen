var fs = require('fs');
var Psql = require('./psql');
var io = require('socket.io')(8888);
// var EE = require('events');
//var psql = new Psql();

// var ee = new EE.EventEmitter();

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
    fs.readFile('docs/index.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 1');
        serverError(500);
      } else {
        renderHtml(content);
      }
    });

  } else if (req.url == "/VK") {
    fs.readFile('../VodovodKoroska/docs/index.html', function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 2');
        serverError(500);
      } else {
        renderHtml(content);
      }
    });

  } else if (parts[1]=='VodovodKoroska') { //to je zato, da se znebimo opozorila v konzoli o missing favicon.ico
    var reqUrl = req.url;

    fs.readFile('..' + reqUrl, function(error, content) {
      if (error) {
        console.log('pošiljam 500 - 4 ../../docs'+reqUrl);

        serverError(500);
      } else {
        renderCSS(content);
      }
    });
    
  } else if (parts[1]=='favicon.ico') { //to je zato, da se znebimo opozorila v konzoli o missing favicon.ico
        try {
          renderFavi();
        
        } catch (err) {
          //handle errors gracefully
          console.log('pošiljam 500 - 4 - favicon');
          serverError(500);
      }
    
  } else {

      var drugi = req.url;

      fs.readFile('docs'+drugi, function(error, content) {
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
  // var socketPripravljen = 1;
  socket.on('sql', function (data) { //-------------cenik sql
    var dz = new Date();
    var casZacetek = dz.getTime();
    console.log ('Poizvedba: ' + data.vpisanaVrednostSQL);
    var vrstic = 0;
    // socketPripravljen = 0;
    // console.log('socketPripravljen = 0 ...');

    Psql.Cenik(data.vpisanaVrednostSQL, data.distinctCena, function(rezultatQ) {
      if (rezultatQ == 'konec') {
        socket.emit('zadnjaVrstica', function(){
          // if (pripravljen.ok){
            var dk = new Date();
            var casKonec = dk.getTime();
            var casPoizvedbe = casKonec - casZacetek;
            // console.log('socketPripravljen = 1 ... ' + casPoizvedbe + ' ms');
          // }
        });
        vrstic = 0;
        // console.log('socket odklenjen ... ');
      }
      else {
          var dv = new Date();
          var casVmesni = dv.getTime() - casZacetek;
          // console.log('pisem vrstico st: ' + vrstic + ' - čas ' + casVmesni + ' ms');
          socket.emit('vrnjeno', rezultatQ);
          vrstic += 1;
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
      // console.log(rezultatQ);
      if (rezultatQ == 'konec') {
        socket.emit('zadnjaVrstica', rezultatQ);

      } else {
        socket.emit('vrnjenoProjekt', rezultatQ);
      }
      rezultatQ = '';
    });
    // socket.disconnect(true);
  });

  socket.on('vodovodKoroska', function (data) {//-------------projekt sql
    // console.log(data);

    var obcina = data.sklop.split('.')[0];

    Psql.vodovodKoroska(data.sklop, '', data.tekst, function(rezultatQ){
      // console.log(rezultatQ);
      if (rezultatQ == 'konec') {
        socket.emit('vodovodKoroskaZadnjaVrstica', rezultatQ);
        
      } else if (rezultatQ.razlaga) {
        socket.emit('vodovodKoroskaMaxPodobnost', rezultatQ.razlaga);
        // console.log(rezultatQ.razlaga);
      } else {
        socket.emit('vodovodKoroskaVrnjeno', rezultatQ);
        // console.log(rezultatQ);
        
      }
      rezultatQ = '';

    });

    Psql.vodovodKoroska(obcina, data.sklop + '%', data.tekst, function(rezultatQ){
      
      if (rezultatQ == 'konec') {
        socket.emit('vodovodKoroskaZadnjaVrsticaObcina', rezultatQ);
        
      } else if (rezultatQ.razlaga) {
        socket.emit('vodovodKoroskaMaxPodobnostObcina', rezultatQ.razlaga);
      } else {
        socket.emit('vodovodKoroskaObcinaVrnjeno', rezultatQ);
        // console.log(rezultatQ);
      }
      rezultatQ = '';

    });

    Psql.vodovodKoroska('', obcina + '%', data.tekst, function(rezultatQ){
      // console.log(rezultatQ);
      if (rezultatQ == 'konec') {
        socket.emit('vodovodKoroskaZadnjaVrsticaProjekt', rezultatQ);
        
      } else if (rezultatQ.razlaga) {
        socket.emit('vodovodKoroskaMaxPodobnostProjekt', rezultatQ.razlaga);
      } else {
        socket.emit('vodovodKoroskaProjektVrnjeno', rezultatQ);
        // console.log(rezultatQ);
        
      }
      rezultatQ = '';

    });



  });

  socket.on('zapriSejo', function () {//-------------projekt sql

    socket.disconnect();
  });
     
});