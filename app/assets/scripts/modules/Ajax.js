import $ from 'jquery';


class Ajax {
  constructor() {
    this.ajaxBtn = $(".btn");
    this.izvajanje();
    console.log('delam');
  }
   
  izvajanje() { //to še nič ne dela
  	
  	this.ajaxBtn.click(function() {
  		console.log('delam');
  		$.ajax({
  			url: "http://localhost/ajaxtle",
  			success: function(result) {
  				console.log(result);
  			}
  		});
  	});
  }
}

export default Ajax;