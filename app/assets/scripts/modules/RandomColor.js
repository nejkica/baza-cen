var distinctColors = require('distinct-colors');

class RandomColor {
	constructor(cb) {
		this.rc = this.ran_col();
		cb(this.rc);
	}

	ran_col() { //function name
        // var color = '#'; // hexadecimal starting symbol 

        var palette = distinctColors({
        	count: 10,
        	hueMin: 200,
        	hueMax: 330,
        	chromaMin: 0,
        	chromaMax: 100,
        	lightMin: 40,
        	lightMax: 70,
        	quality: 50,
        	samples: 30
        	});
        
        // var letters = ['000000','FF0000','00FF00','0000FF','FFFF00','00FFFF','FF00FF','C0C0C0']; //Set your colors here
        var color = palette[Math.floor(Math.random() * palette.length)];
        return color;
	}
}

export default RandomColor;