var gulp = require('gulp'),
pg = require('pg') ;


//Psql.prototype.poizvedba = 
function Psql(vnos, callback) {

	var sqlVnos = "%" + vnos + "%";
	var rezultat = "nič";	
	var config = {
		user: 'postgres', //env var: PGUSER 
		database: 'BazaCenikov', //env var: PGDATABASE 
		password: 'kookaburra@72', //env var: PGPASSWORD 
		host: 'kookaburra.si', // Server hosting the postgres database 
		port: 5432, //env var: PGPORT 
		max: 10, // max number of clients in the pool 
		idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed 
	};


	var client = new pg.Client(config);

	client.connect(function (err) {
		
		
	var query = client.query("SELECT * FROM cenik WHERE \"Opis\" LIKE $1", [sqlVnos], function(err, result){

		var rezultat = JSON.stringify(result.rows, null, "   ");
//
		callback(rezultat);
	});

	client.on('error', function(error) {
      console.log(error);
    });


	});


}

exports.Psql = Psql;