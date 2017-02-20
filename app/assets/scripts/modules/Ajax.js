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
		this.izbraniProjekt = $(".modal__projekti");
    this.socket = io.connect('http://localhost:8888');
		this.vpisZnaka();
		this.projektiAjax();
		this.projektAjax();
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
  		$.ajax({
  			url: "http://localhost/projekt/" + poizvedba,
  			success: function(result) {
  				var rezultat = JSON.parse(result);
  				var n = 0;
  				$.each(rezultat, function(index, item) {
  					Object.values(item).forEach(function(value) {
  						var trenutniKey = Object.keys(rezultat[0])[n];
  						
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
  				}); //--- konec ---each rezultat (vrstica)
  			}, // --- konec --- success ajaxa
  			error: function (jqXHR, exception) {
				        console.log(jqXHR.status + ' ' + exception );
				    	}
  		}); //konec ajax
  	}));
	}


  projektiAjax() { 
  	this.ajaxBtn.click(function() {
  		
  		$.ajax({
  			url: "http://localhost/projekti",
  			success: function(result) {
  				$('.modal__projekti').empty();
  				var rezultat = JSON.parse(result);
  				$.each(rezultat, function(index, item) {
  					Object.values(item).forEach(function(value) {
				
							$('.modal__projekti').append('<a href="#" class="modal__projekti__projekt projektI' + index + '">' + value + '</a>');
							var rc = new RandomColor(function(barva){ return barva;});
		  				// console.log(rc.rc);
		  				$('.projektI' + index).css("background-color", rc.rc);
  					}); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )
  				
  				}); //--- konec ---each rezultat (vrstica)
  			// $('.modal__projekti__projekt').each(function() {
  			// 	var rc = new RandomColor(function(barva){ return barva});
  			// 	console.log(rc.rc);
  			// 	$('.modal__projekti__projekt').css("background-color", rc.rc);
  			// });
  			}, // --- konec --- success ajaxa
  			error: function (jqXHR, exception) {
				        console.log(jqXHR.status + ' ' + exception );
				    	}
  		}); //konec ajax
  	});
	}

  cenikAjax() { 
  	var that = this;
		var vpisanaVrednost = $(".site-header__elements__input__field").val().toLowerCase();
		var vpisanaVrednostArr = vpisanaVrednost.split(" ");
    var dodajCeniStil = "rezultati__gumb-cena--vklopljen";
    // console.log(vpisanaVrednostArr);
		if (vpisanaVrednost.length > 1) {

      if (that.distinctCena == 0) {
        dodajCeniStil = "";
      } 
      $('#t-naslovna-vrstica').empty();
      $('.nabor-projektov').empty();
      $('#t-body').empty();
      
      var stVrstic = 0;
      
      that.socket.emit('sql', { vpisanaVrednost: vpisanaVrednost, distinctCena : that.distinctCena});
      that.socket.on('vrnjeno', function(data){
          stVrstic += 1;
          if (stVrstic == 1) {
            Object.keys(data).forEach(function(k) {

            k = k.replace(/_/g, " "); // zato, ker imena v sql stolpcih niso s presledki
            console.log(k);
            // $('#t-naslovna-vrstica').append(k);
            $('#t-naslovna-vrstica').append('<th class="table--header--th" id="th-'+ k +'">' + k + '</th>');
            
            if (k=="Cena") {
              $('#th-Cena').empty();
              $('#th-Cena').append("<a href=# class=\"rezultati__gumb-cena " + dodajCeniStil + "\" id=\"gumb-cena\">" + k + "</a>" );
            }
          });

            var gumbCena = new GumbCena(function(res) {
            // console.log('prišlo' + res);
            if (res == 1) {
              that.distinctCena = 0;
            } else if (res == 0) {
              that.distinctCena = 1;
            }

          });
          }

          $('#t-body').append('<tr class="table--body--row" id="row-' + stVrstic + '"></tr>');

          // console.log(rezultat);
          var naborProjektov = [];
      });
      that.socket.on('zadnjaVrstica', function(){
          $('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: ' + stVrstic);
          stVrstic = 0;
          console.log('konec cl');
          that.socket.disconnect(true);
          that.socket = io.connect('http://localhost:8888');
      });
      
  		
		} else {
			$('#t-body').empty();
			$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0');
			$('.nabor-projektov').empty();
		}
	}

}

export default Ajax;