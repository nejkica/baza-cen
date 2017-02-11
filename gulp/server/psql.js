var gulp = require('gulp'),
pg = require('pg') ;


//Psql.prototype.poizvedba = 
function Psql(vnos, callback) {
	//console.log(vnos);
	var rezultat = "nič";	
	var vnosArr = vnos.split('%20');
	//console.log(vnosArr);
	vnosArrSQL = [];

	var sqlQ = "SELECT DISTINCT ON (\"Opis\") \"Poz\",\
	 ('<b>'||\"N1\"||'-'||\"N2\"||'-'||\"N3\"||'-'||\"N4\"\
	 ||'-'||\"N5\"||'</b>-'||\"Opis\") AS \"Opis_z_naslovi\",\
	  \"EM\",\"Cena\",\"Valuta\",\"Projekt\",\"Fkor\",\"Opomba\",\
	  \"Kljuc\" FROM cenik WHERE";

	for (i=0; i < vnosArr.length; i++) {
		if ( i > 0 ) {
			sqlQ += " AND"
		}
		sqlQ += " (LOWER(\"Opis\") LIKE LOWER($" + (i+1) + ")\
		 OR LOWER(\"N1\") LIKE LOWER($" + (i+1) + ")\
		  OR LOWER(\"N2\") LIKE LOWER($" + (i+1) + ")\
		  OR LOWER(\"N3\") LIKE LOWER($" + (i+1) + ")\
		  OR LOWER(\"N4\") LIKE LOWER($" + (i+1) + ")\
		  OR LOWER(\"N5\") LIKE LOWER($" + (i+1) + ")\
		  OR LOWER(\"Projekt\") LIKE LOWER($" + (i+1) + "))";

		vnosArrSQL.push("%" + vnosArr[i] + "%");
	}

	sqlQ += " ORDER BY \"Opis\" LIMIT 200";
	//console.log(sqlQ);
	// var sqlVnos = "%" + vnos + "%";

	var config = {
		user: 'postgres', //env var: PGUSER 
		database: 'BazaCenikov', //env var: PGDATABASE 
		password: 'kookaburra@72', //env var: PGPASSWORD 
		host: 'kookaburra.si', // Server hosting the postgres database 
		port: 5432, //env var: PGPORT 
		max: 10, // max number of clients in the pool 
		idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed 
	};


	// var client = new pg.Client(config);
	var pool = new pg.Pool(config);
	// client.connect(function (err) {
	pool.connect(function (err, client, done) {	
		if (err) {
			return console.error('napaka pri iskanju client iz pool-a', err);
		}
		
//	var query = client.query("SELECT * FROM cenik WHERE \"Opis\" LIKE $1", [sqlVnos], function(err, result){
	client.query(sqlQ, vnosArrSQL, function(err, result){
		done();
		if(err) {
	      return console.error('query ni uspel', err);
	    }
		var rezultat = JSON.stringify(result.rows, null, "   ");
//
		callback(rezultat);
	});

	pool.on('error', function(error) {
      console.log(error);
    });


	});


}

exports.Psql = Psql;