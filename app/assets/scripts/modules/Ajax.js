import $ from 'jquery';
import dateFormat from 'dateformat';
import Delay from './InputDelay';
import RandomColor from './RandomColor';
import GumbCena from './GumbCena';
import io from 'socket.io-client';


class Ajax {
	constructor() {
    this.distinctCena = 0;
		this.ajaxBtn = $(".btn");
		this.inputOpis = $("#inputOpis");
    this.inputOpis.focus();
		this.izbraniProjekt = $(".modal__projekti");
    this.socket = io.connect('http://192.168.112.200:8888');
		this.vpisZnaka();
		this.projektiAjax();
		this.projektAjax();
    this.events();
	}

  events(){
    var that = this;
    $('#t-body').on('click', '.table--td--postavka', function() {
      that.pokaziPostavko(this);
    });

    $('.postavka').on('click', function() {
      $(this).toggleClass('postavka-pokazi');
    });
  }

  pokaziPostavko(el) {
    var idParent = $(el).parent().attr('class').split('-');
    
    var zst = idParent[idParent.length - 1];
    var poz = $('.table--td--Poz-' + zst);
    var opisZnaslovi = $('.table--td--Opis_z_naslovi-' + zst);
    var em = $('.table--td--EM-' + zst);
    var cenav = $('.table--td--cenaV-' + zst);
    var fkor = $('.table--td--Fkor-' + zst);
    var projekt = $('.table--td--Projekt-' + zst);
    var cenaE = $('.table--td--cenaEUR-' + zst);

    $('.postavka').empty();
    $('.postavka').append('<div class="postavka-poz">' + poz.text() + '</div>');
    $('.postavka').append('<div class="postavka-opis">' + opisZnaslovi.text() + '</div>');
    $('.postavka').append('<div class="postavka-em">' + em.text() + '</div>');
    $('.postavka').append('<div class="postavka-cenav">' + cenav.text() + '</div>');
    $('.postavka').append('<div class="postavka-fkor">' + fkor.text() + '</div>');
    $('.postavka').append('<div class="postavka-projekt">' + projekt.text() + '</div>');
    $('.postavka').append('<div class="postavka-cenaE">' + cenaE.text() + '</div>');

    $('.postavka').toggleClass('postavka-pokazi');

  }

	vpisZnaka() {
		var zamik = new Delay();
		var that = this;
		this.inputOpis.keyup(zamik.debounce(function() {
			that.cenikAjax();
		}, 250));
  }

  projektAjax() { 
  	var that = this;
  	this.izbraniProjekt.on("click", "a", (function() {
  		$('.modal__wrapper').empty();
  		var poizvedba = $(this).text().toLowerCase();
  		var n = 0;
      that.socket.emit('projekt', { poizvedba: poizvedba});
      that.socket.on('vrnjenoProjekt', function(data){
        Object.values(data).forEach(function(value) {
          var trenutniKey = Object.keys(data)[n];
          // console.log(trenutniKey);
          // console.log(value);
          
          if (trenutniKey == 'Projekt') {
            $('.modal__wrapper').prepend('<div class="modal__vrstica"><p class="modal__key">' + trenutniKey + ':</p><h2 class="modal__header"> ' + value + '</h2></div>');
          } else if (trenutniKey == 'TOC' || trenutniKey == 'PC' || trenutniKey=='DATE-OF-SIGNING') {
              $('.modal__wrapper').append('<div class="modal__vrstica"><p class="modal__key">' + trenutniKey + ':</p><p class="modal__value"> ' + dateFormat(new Date(value), "dd.mm.yyyy") + '</p></div>');
          } else if (trenutniKey == 'CONTRACT-VALUE') {
              $('.modal__wrapper').append('<div class="modal__vrstica"><p class="modal__key">' + trenutniKey + ':</p><p class="modal__value"> ' + value.toLocaleString('de-DE', { style: 'decimal', minimumFractionDigits: 2 }) + ' EUR brez DDV</p></div>');
          } else if (trenutniKey == 'Capacity') {
              $('.modal__wrapper').append('<div class="modal__vrstica"><p class="modal__key">' + trenutniKey + ':</p><p class="modal__value"> ' + parseFloat(value).toLocaleString('de-DE', { style: 'decimal', minimumFractionDigits: 0 }) + ' (PE, ton/l, m3/h)</p></div>');
          } else {
              $('.modal__wrapper').append('<div class="modal__vrstica"><p class="modal__key">' + trenutniKey + ':</p><p class="modal__value"> ' + value + '</p></div>');
          }
          n += 1;
        }); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )

      }); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )

      that.socket.on('zadnjaVrstica', function(){
          // console.log('konec cl');
          n = 0;
          that.socket.disconnect(true);
          that.socket = io.connect('http://192.168.112.200:8888');
      });
    }));
	}


  projektiAjax() { 
    var that = this;
  	this.ajaxBtn.click(function() {
      var index = 0;
      $('.modal__projekti').empty();
  		that.socket.emit('projekti', '');
      that.socket.on('vrnjenoProjekti', function(data){
        
        Object.values(data).forEach(function(value) {
        
          $('.modal__projekti').append('<a href="#" class="modal__projekti__projekt projektI' + index + '">' + value + '</a>');
          var rc = new RandomColor(function(barva){ return barva;});
          // console.log(rc.rc);
          $('.projektI' + index).css("background-color", rc.rc);
          index += 1;
        }); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )

    	});

      that.socket.on('zadnjaVrstica', function(){
          // console.log('konec cl');
          that.socket.disconnect(true);
          that.socket = io.connect('http://192.168.112.200:8888');
      });
  	});
  }

  cenikAjax() { 
  	var that = this;
    var dz = new Date();
    var casZacetek = dz.getTime();

		var vpisanaVrednost = $(".site-header__elements__input__field").val();
    var stZnakovVpolju = vpisanaVrednost.length;
    // var vvVmesna = [];
		var vVArrNarekovaj = vpisanaVrednost.match(/\"(.*?)\"/gi); // array besed v narekovajih
    
    if (vVArrNarekovaj !== null){ //odstranjujemo besede, ki so v narekovajih ...
      vVArrNarekovaj.forEach(function(entry){
        var i = vVArrNarekovaj.indexOf(entry);
        vpisanaVrednost = vpisanaVrednost.replace(entry, '');
        vVArrNarekovaj[i] = vVArrNarekovaj[i].replace(/\"/g, "");
      });
    } 

    var vpisanaVrednostArr = vpisanaVrednost.split(" ");
    vpisanaVrednostArr = this.cleanArray(vpisanaVrednostArr.concat(vVArrNarekovaj)); // ... in jih tukaj dodamo
    // console.log(vpisanaVrednostArr.length);
    var dodajCeniStil = "rezultati__gumb-cena--vklopljen";

		if (stZnakovVpolju > 1) {

      if (that.distinctCena == 0) {
        dodajCeniStil = "";
      } 
      
      var stVrstic = 0;
      var naborProjektov = [];
      console.log(vpisanaVrednostArr);

      //---------------------------------- socket.io -----------------------
      that.socket.emit('sql', { vpisanaVrednostSQL: vpisanaVrednostArr, distinctCena : that.distinctCena});
      that.socket.on('vrnjeno', function(data){
        // var dv = new Date();
        // var casVmesni = dv.getTime() - casZacetek;
        // console.log('vrstica st '+ stVrstic + ' čas ' + casVmesni + ' ms');
        stVrstic += 1;
        if (stVrstic == 1) {
          $('#t-naslovna-vrstica').empty();
          $('.nabor-projektov').empty();
          $('#t-body').empty();
          Object.keys(data).forEach(function(k) {

          k = k.replace(/_/g, " "); // zato, ker imena v sql stolpcih niso s presledki
          $('#t-naslovna-vrstica').append('<th class="table--header--th" id="th-'+ k +'">' + k + '</th>');
          
          if (k=="cenaEUR") {
            $('#th-cenaEUR').empty();
            $('#th-cenaEUR').append("<a href=# class=\"rezultati__gumb-cena " + dodajCeniStil + "\" id=\"gumb-cena\">" + k + "</a>" );
          }
        });

          var gumbCena = new GumbCena(function(res) {
          if (res == 1) {
            that.distinctCena = 0;
          } else if (res == 0) {
            that.distinctCena = 1;
          }

        });
        }

        $('#t-body').append('<tr class="table--body--row" id="row-' + stVrstic + '"></tr>');

        var idVrstice = "#row-" + stVrstic;
        var m = 0;

        Object.values(data).forEach(function(value) {
          var vrednost = value;
          var trenutniKey = Object.keys(data)[m];
          
          $(idVrstice).append('<td class="table--td--' + trenutniKey + '-' + stVrstic + '"></td>'); 
          var selTd = '.table--td--' + Object.keys(data)[m] + '-' + stVrstic;
          
          if ((selTd.indexOf("Opis_z_naslovi") >= 0) || (selTd.indexOf("Projekt") >= 0)){ //tukaj highlight-amo iskani niz
            // console.log(vpisanaVrednostArr);
            
            // }
          } else if ((selTd.indexOf("cenaV") >= 0) || (selTd.indexOf("Fkor") >= 0) || (selTd.indexOf("cenaEUR") >= 0)) {
            if(selTd.indexOf("cenaV") >= 0) {
              var vrednostValuta = vrednost.split(" ");
              vrednostValuta[0] = Number(vrednostValuta[0]);
              vrednost = vrednostValuta[0].toLocaleString(undefined, {minimumFractionDigits: 2});
              vrednost = vrednost + ' ' + vrednostValuta[1];
            } else {
                vrednost = vrednost.toLocaleString(undefined, {minimumFractionDigits: 2});
            }
            $(selTd).css({"text-align":"right", "white-space":"nowrap"});

            if(selTd.indexOf("cenaEUR") >= 0){
              vrednost = vrednost + " EUR";
            }
          }

          $(selTd).append(vrednost);    

          if ((trenutniKey == 'Projekt') && ($.inArray(value, naborProjektov) == -1)) {
            naborProjektov.push(value);

            $('.nabor-projektov').append('<a href="#" class="nabor-projektov__projekt" id="open-modal">' + value + '</a>');
          }
          m +=1;
        }); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )
        // console.log(rezultat);
          
      });

      that.socket.on('zadnjaVrstica', function(cb){
        var dk = new Date();
        var casKonec = dk.getTime();
        var casNalaganja = casKonec - casZacetek;
        console.log('zadnja vrstica prispela... ' + casNalaganja + ' ms' );
        $('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: ' + stVrstic);
        $('[class^=table--td--naslov]').highlight(vpisanaVrednostArr);
        $('[class^=table--td--opis]').highlight(vpisanaVrednostArr);
        $('[class^=table--td--Projekt]').highlight(vpisanaVrednostArr);
        stVrstic = 0;
        naborProjektov = [];
        cb({ok:true});
        // console.log('konec cl');
        that.socket.disconnect(true);

        that.socket = io.connect('http://192.168.112.200:8888');
      });
      
  		
		} else {
			$('#t-body').empty();
			$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0');
			$('.nabor-projektov').empty();
		}
	}

  cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i]);
      }
    }
    return newArray;
  }
}

export default Ajax;