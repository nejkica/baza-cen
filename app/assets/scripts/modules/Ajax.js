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
  			url: "http://localhost/sql/"+ $(".input__field").val() ,
  			success: function(result) {
  				console.log(result);
  				$("#rezultat").html("<p>result</p>");
  			}
  		});
  	});
  }
}

export default Ajax;