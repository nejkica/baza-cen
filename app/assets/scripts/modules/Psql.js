
import pg from 'pg';

 
// instantiate a new client 
// the client will read connection information from 
// the same environment variables used by postgres cli tools 

class Psql {
  constructor() {
    //this.client = new pg.Client();

  }
   
  izvajanje() { //to še nič ne dela
  // connect to our database 
//    client.connect(function (err) {
//      if (err) throw err;
     //
//      // execute a query on our database 
//      client.query('SELECT $1::text as name', ['brianc'], function (err, result) {
//        if (err) throw err;
     //
//        // just print the result to the console 
//        console.log(result.rows[0]); // outputs: { name: 'brianc' } 
     //
//        // disconnect the client 
//        client.end(function (err) {
//          if (err) throw err;
//        });
//      });
//    });
  }
}

export default Psql;