import $ from 'jquery';

class KlikNaProjekt {
	constructor() {
		// this.projekt = $('.nabor-projektov__projekt');
		this.inputOpis = $("#inputOpis");
		this.naborProjektov = $('.nabor-projektov');
		this.dodajVinput();
	}

	dodajVinput () {
		var that = this;
		this.naborProjektov.on('click', '.nabor-projektov__projekt', function(){
			var izbraniProjekt = $(this).text();
			var zacetnaVrednostinputa = that.inputOpis.val();
			console.log(izbraniProjekt + " " + zacetnaVrednostinputa);
			that.inputOpis.val(zacetnaVrednostinputa + " " + izbraniProjekt + " ");
			that.inputOpis.trigger('keyup');
		});
		
	}
}

export default KlikNaProjekt;