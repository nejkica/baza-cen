import $ from 'jquery';


class Ajax {
	constructor() {
		this.ajaxBtn = $(".btn");
		this.inputOpis = $(".input__field");
		this.izvajanje();
		console.log('delam');
	}
   
  izvajanje() { //to še nič ne dela
  	
//  	this.ajaxBtn.click(function() {
		this.inputOpis.keyup(function() {
//  		console.log('delam');
  		var vpisanaVrednost = $(".input__field").val();
  		var vpisanaVrednostArr = vpisanaVrednost.split(" ");
			console.log(vpisanaVrednostArr);
  		//console.log(vpisanaVrednost);

  		if (vpisanaVrednost.length > 2) {
	  		$.ajax({
	  			url: "http://localhost/sql/" + vpisanaVrednost ,
	  			success: function(result) {
	  				var rezultat = JSON.parse(result);
	  				
	  				//najprej izpis glave
	  				$('#t-naslovna-vrstica').empty();
	  				$('#t-body').empty();
	  				Object.keys(rezultat[0]).forEach(function(k) {

	  					$('#t-naslovna-vrstica').append('<th class="table--header--th">' + k + '</th>');
	  				});

	  				//potem izpis rezultatov
	  				//console.log(Object.values(rezultat));
	  				$.each(rezultat, function(index, item) {
	  					$('#t-body').append('<tr class="table--body--row" id="row-' + index + '"></tr>');
	  					//console.log(index + ' ' + Object.values(item));

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

	  			}
	  		});
  		} else {
  			$('#t-body').empty();
  		}

		});
	}
}
export default Ajax;