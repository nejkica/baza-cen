import $ from 'jquery';
import Delay from './InputDelay';

class Ajax {
	constructor() {
		this.ajaxBtn = $(".btn");
		this.inputOpis = $("#inputOpis");
		this.izvajanje();
		this.vpisZnaka();
		//console.log('delam');
	}

	vpisZnaka() {
		var zamik = new Delay;

		this.inputOpis.keyup(zamik.debounce(function() {
			console.log('test po eni sekundi');
		}, 1000));
  }

  izvajanje() { 
  	
//  	this.ajaxBtn.click(function() {
		this.inputOpis.keyup(function() {
  		//console.log('delam');
  		var vpisanaVrednost = $(".site-header__elements__input__field").val();
  		var vpisanaVrednostArr = vpisanaVrednost.split(" ");

  		if (vpisanaVrednost.length > 1) {
	  		$.ajax({
	  			url: "http://localhost/sql/" + vpisanaVrednost ,
	  			success: function(result) {
	  				var rezultat = JSON.parse(result);
	  				var stVrstic = rezultat.length;

	  				$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: ' + stVrstic)
	  				//najprej izpis glave
	  				
	  				$('#t-body').empty();

	  				if (rezultat == 0){
	  					$('#stVrnjenihRezultatov').text('Št. vrnjenih rezultatov: 0')
	  					throw new Error("Rezultat poizvedbe je 0");
	  				}

	  				$('#t-naslovna-vrstica').empty();
	  				Object.keys(rezultat[0]).forEach(function(k) {

	  					$('#t-naslovna-vrstica').append('<th class="table--header--th">' + k + '</th>');
	  				});

	  				//potem izpis rezultatov
	  				//console.log(Object.values(rezultat));
	  				$.each(rezultat, function(index, item) {
	  					$('#t-body').append('<tr class="table--body--row" id="row-' + index + '"></tr>');
	  					
	  					var m = 0;
	  					Object.values(item).forEach(function(value) {
	  						var idVrstice = "#row-" + index;
	  						
	  						//console.log(value);
	  						$(idVrstice).append('<td class="table--td--' + Object.keys(item)[m] + '-' + index + '"></td>'); 
								//console.log(Object.keys(item)[m]);
								var selTd = '.table--td--' + Object.keys(item)[m] + '-' + index;
								
								if (selTd.indexOf("Opis") >= 0){
									
									for (var i=0; i < vpisanaVrednostArr.length; i++) {
										//console.log(vpisanaVrednostArr[i]);
										var iskaniStr = vpisanaVrednostArr[i];
										var zamenjajZ = '<span>' + vpisanaVrednostArr[i] + '</span>';
										value = value.replace(iskaniStr, zamenjajZ);
									}
					
								}

								$(selTd).append(value);		

	  						m +=1;
	  					});
	  					
	  				});

	  			},
	  			error: function (jqXHR, exception) {
					        console.log(jqXHR.status + ' ' + exception );
					    	}
	  		}); //konec ajax
  		} else {
  			$('#t-body').empty();
  		}

		}); //konec keyup
	}
}
export default Ajax;