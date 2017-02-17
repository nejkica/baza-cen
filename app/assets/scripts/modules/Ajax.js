import $ from 'jquery';
import dateFormat from 'dateformat';
import Delay from './InputDelay';
import RandomColor from './RandomColor';
import GumbCena from './GumbCena';


class Ajax {
	constructor() {
    this.distinctCena = 0;
		this.ajaxBtn = $(".btn");
		this.inputOpis = $("#inputOpis");
		this.izbraniProjekt = $(".modal__projekti");
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

  		$.ajax({
  			url: "http://localhost/sql/" + vpisanaVrednost + "/" + that.distinctCena,
  			success: function(result) {
  				var rezultat = JSON.parse(result);
  				var stVrstic = rezultat.length;
  				var naborProjektov = [];

  				$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: ' + stVrstic);
  				//najprej izpis glave
  				
  				$('#t-body').empty();

  				if (rezultat === 0){
  					$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0');
  					// throw new Error("Rezultat poizvedbe je 0");
  				}

  				$('#t-naslovna-vrstica').empty();
  				Object.keys(rezultat[0]).forEach(function(k) {
  					k = k.replace(/_/g, " "); // zato, ker imena v sql stolpcih niso s presledki

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

          }); //mora biti tukaj, ker je dinamično narejen gumb in ga drugače ne morem togglat
          
          

  				//potem izpis rezultatov
  				$('.nabor-projektov').empty();
  				$.each(rezultat, function(index, item) {
  					$('#t-body').append('<tr class="table--body--row" id="row-' + index + '"></tr>');
  					
  					var m = 0;

  					Object.values(item).forEach(function(value) {
  						var vrednost = value;
  						var idVrstice = "#row-" + index;
  						var trenutniKey = Object.keys(item)[m];
  						
  						$(idVrstice).append('<td class="table--td--' + trenutniKey + '-' + index + '"></td>'); 
							var selTd = '.table--td--' + Object.keys(item)[m] + '-' + index;
							
							if ((selTd.indexOf("Opis_z_naslovi") >= 0) || (selTd.indexOf("Projekt") >= 0)){ //tukaj highlight-amo iskani niz
								
								for (var i=0; i < vpisanaVrednostArr.length; i++) {
									var iskaniStr = vpisanaVrednostArr[i];

									 var zamenjajZ = '<span>' + vpisanaVrednostArr[i] + '</span>';
									if (iskaniStr.length > 1){
  								  var iskaniStrRegEx = new RegExp(iskaniStr, "ig");
                    vrednost = vrednost.replace(iskaniStrRegEx, zamenjajZ);
									}
								}
							} //--- konec ---tukaj highlight-amo iskani niz

							$(selTd).append(vrednost);		

							if ((trenutniKey == 'Projekt') && ($.inArray(value, naborProjektov) == -1)) {
								naborProjektov.push(value);
								$('.nabor-projektov').append('<a href="#" class="nabor-projektov__projekt" id="open-modal">' + value + '</a>');
							}
  						m +=1;
  					}); //--- konec --- each item (zapis vsakega elementa JSON objekta za vsako vrstico )
  					
  				}); //--- konec ---each rezultat (vrstica)

  			}, // --- konec --- success ajaxa
  			error: function (jqXHR, exception) {
				        console.log(jqXHR.status + ' ' + exception );
				    	}
  		}); //konec ajax
		} else {
			$('#t-body').empty();
			$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0');
			$('.nabor-projektov').empty();
		}
	}

}

export default Ajax;