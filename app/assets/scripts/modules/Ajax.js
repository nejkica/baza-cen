import $ from 'jquery';
import Delay from './InputDelay';

class Ajax {
	constructor() {
		this.ajaxBtn = $(".btn");
		this.inputOpis = $("#inputOpis");
		// this.izvajanje();
		this.vpisZnaka();
		//console.log('delam');
	}

	vpisZnaka() {
		var zamik = new Delay;
		var that = this;
		this.inputOpis.keyup(zamik.debounce(function() {
			// console.log('tipka pritisnjena');
			that.izvajanje();
		}, 250));
		// this.inputOpis.keyup(function() {
		// 	// console.log('tipka pritisnjena');
		// 	that.izvajanje();
		// });
  }

  izvajanje() { 
  	
//  	this.ajaxBtn.click(function() {
		// this.inputOpis.keyup(function() {
  		//console.log('delam');
		var vpisanaVrednost = $(".site-header__elements__input__field").val();
		var vpisanaVrednostArr = vpisanaVrednost.split(" ");

		if (vpisanaVrednost.length > 1) {
  		$.ajax({
  			url: "http://localhost/sql/" + vpisanaVrednost ,
  			success: function(result) {
  				var rezultat = JSON.parse(result);
  				var stVrstic = rezultat.length;
  				var naborProjektov = [];

					// $('.nabor-projektov__projekt').each(function(){
 				// 		naborProjektov.push($(this).text());
 				// 		// console.log(naborProjektov);
 				// 	});


  				$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: ' + stVrstic)
  				//najprej izpis glave
  				
  				$('#t-body').empty();

  				if (rezultat == 0){
  					$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0')
  					throw new Error("Rezultat poizvedbe je 0");
  				}

  				$('#t-naslovna-vrstica').empty();
  				Object.keys(rezultat[0]).forEach(function(k) {
  					k = k.replace(/_/g, " ");
  					$('#t-naslovna-vrstica').append('<th class="table--header--th">' + k + '</th>');
  				});

  				//potem izpis rezultatov
  				//console.log(Object.values(rezultat));
  				$('.nabor-projektov').empty();
  				$.each(rezultat, function(index, item) {
  					$('#t-body').append('<tr class="table--body--row" id="row-' + index + '"></tr>');
  					
  					var m = 0;

  					Object.values(item).forEach(function(value) {
  						var idVrstice = "#row-" + index;
  						var trenutniKey = Object.keys(item)[m];
  						
  						//console.log(value);
  						$(idVrstice).append('<td class="table--td--' + trenutniKey + '-' + index + '"></td>'); 
							//console.log(Object.keys(item)[m]);
							var selTd = '.table--td--' + Object.keys(item)[m] + '-' + index;
							
							if ((selTd.indexOf("Opis_z_naslovi") >= 0) || (selTd.indexOf("Projekt") >= 0)){ //tukaj highlight-amo iskani niz
								
								for (var i=0; i < vpisanaVrednostArr.length; i++) {
									//console.log(vpisanaVrednostArr[i]);
									var iskaniStr = vpisanaVrednostArr[i];

									 var zamenjajZ = '<span>' + vpisanaVrednostArr[i] + '</span>';
									// value = value.replace(iskaniStr, zamenjajZ);
									if (iskaniStr.length > 1){
										var iskaniStrRegEx = new RegExp(iskaniStr, "ig");
										value = value.replace(iskaniStrRegEx, zamenjajZ);
										// console.log(ArrSpozicijami);

									}
								}
							} //--- konec ---tukaj highlight-amo iskani niz

							$(selTd).append(value);		

							if ((trenutniKey == 'Projekt') && ($.inArray(value, naborProjektov) == -1)) {
								naborProjektov.push(value);
								$('.nabor-projektov').append('<a href="#" class="nabor-projektov__projekt">' + value + '</a>');
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
			$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0')
			$('.nabor-projektov').empty();
		}

		// }); //konec keyup
	}
}
export default Ajax;