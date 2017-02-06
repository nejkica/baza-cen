var gulp = require('gulp'),
pg = require('pg') ;

var Psql = function(){};

Psql.prototype.poizvedba = function (vnos) {

	var sqlVnos = "%" + vnos + "%";
		
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
		if (err) throw err;
		
		var query = client.query("SELECT * FROM cenik WHERE \"Opis\" LIKE $1", [sqlVnos]);
//		var query = client.query("copy (SELECT row_to_json(t) FROM (select * from cenik) t) to '/home/kookaburra/share/myfile'");
//		var query = client.query("select array_to_json(array_agg(row_to_json(t))) from (select * from cenik) t");
		//console.log(query)



    	client.on('error', function(error) {
	      console.log(error);
	    });

		client.on('drain', client.end.bind(client));
		//client.end(function (err) {
	    //  if (err) throw err;
	    //});

	    query.on('row', function(row, result){ 
	    	result.addRow(row);
//	    	console.log(row);
	    });

	    query.on('end', function(result) {
	      	
	      	rezultat = JSON.stringify(result.rows, null, "   ");
	      	console.log(rezultat);
			console.log(result.rows.length + ' rows were received');
			client.end();
	    });

	});	

	return rezultat;
}

module.exports = Psql;