import $ from 'jquery';

class Delay {
	constructor() {
		
		this.debounce();
	}

	debounce(fn, delay) {
	  var timer = null;
	  return function () {
	    var context = this, args = arguments;
	    clearTimeout(timer);
	    timer = setTimeout(function () {
	      fn.apply(context, args);
	    }, delay);
	  };
	}
	
}
export default Delay;