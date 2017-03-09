import $ from 'jquery';

class GumbCena {
	constructor (callback) {
		this.gumbCena = $('#th-cenaEUR');
		this.inputOpis = $("#inputOpis"); //ga rabim zaradi triggerja za stolpec cena - da mi da distinct ceno query
		this.events();
		this.cb = callback;

	}

	events () {
		var that = this;
		this.gumbCena.on('click', '#gumb-cena', function() {
			that.toggleGumb();
		});
	}

	toggleGumb () {
		var distinctCena = 0;
		$('#gumb-cena').toggleClass('rezultati__gumb-cena--vklopljen') ;
		// console.log($('#gumb-cena').is('.rezultati__gumb-cena--vklopljen'));
		if($('#gumb-cena').is('.rezultati__gumb-cena--vklopljen') == true){
			distinctCena = 0;
		} else {
			distinctCena = 1;
		}

		this.triggerSQL(distinctCena);
	}

	triggerSQL (dc) {
		// console.log(dc);
		
		this.inputOpis.keyup();
		this.cb(dc);
	}
}

export default GumbCena;