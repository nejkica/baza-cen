// var gulp = require('gulp'),
// var cursor = require('pg-cursor');
var pg = require('pg') ;


//Psql.prototype.poizvedba = 
function Cenik(vnos, kljukicaCena, callback) {
	//console.log(vnos);
	var rezultat = "nič";
	var limitRezultatov = 50;
	var vnosArr = vnos;
	// console.log(vnosArr);
	vnosArrSQL = [];
	var sqlQ = "";

	var stolpciSQL = "\"cenik\".\"ID\", \"cenik\".\"Poz\", ('<div class=\"table--td--postavka\"><div class=\"table--td--naslov\">'||\"cenik\".\"N1\"||'-'||\"cenik\".\"N2\"||'-'||\"cenik\".\"N3\"||'-'||\"cenik\".\"N4\" ||'-'||\"cenik\".\"N5\"||'</div><div class=\"table--td--opis\">'||\"cenik\".\"Opis\"||'</div></div>') AS \"Opis_z_naslovi\",\"cenik\".\"EM\",(\"cenik\".\"Cena\" ||' '|| \"cenik\".\"Valuta\") AS \"cenaV\",\"cenik\".\"Fkor\",\"projektir12\".\"Projekt\",\"cenik\".\"cenaEUR\"";

	if (kljukicaCena == 0){
		sqlQ = "SELECT * FROM (SELECT " + stolpciSQL + " FROM cenik, projektir12 WHERE (\"cenik\".\"Projekt\" = \"projektir12\".\"IDp\") AND (";
// ,\"cenik\".\"Kljuc\"
//DISTINCT ON (regexp_replace(\"cenik\".\"Opis\", E\'[\\\n\\\r]+\', \'\', \'g\' ))
		for (i=0; i < vnosArr.length; i++) {
			if ( i > 0 ) {
				sqlQ += " AND";
			}
			sqlQ += " ((\"Opis\") LIKE ($" + (i+1) + ") OR (\"N1\") LIKE ($" + (i+1) + ") OR (\"N2\") LIKE ($" + (i+1) + ") OR (\"N3\") LIKE ($" + (i+1) + ") OR (\"N4\") LIKE ($" + (i+1) + ") OR (\"N5\") LIKE ($" + (i+1) + ") OR (\"projektir12\".\"Projekt\") LIKE ($" + (i+1) + "))";

			vnosArrSQL.push("%" + vnosArr[i] + "%");
		}

		sqlQ += ")) AS rezultat GROUP BY \"rezultat\".\"Opis_z_naslovi\", \"rezultat\".\"ID\",\"rezultat\".\"Projekt\", \"rezultat\".\"Poz\",\"rezultat\".\"EM\",\"rezultat\".\"cenaV\",\"rezultat\".\"Fkor\",\"rezultat\".\"cenaEUR\" LIMIT " + limitRezultatov;
		//console.log(sqlQ);
		// var sqlVnos = "%" + vnos + "%";
	} else if (kljukicaCena == 1){
		sqlQ = "SELECT DISTINCT ON (\"cenik\".\"cenaEUR\") \"cenik\".\"Poz\", (\"cenik\".\"N1\"||'-'||\"cenik\".\"N2\"||'-'||\"cenik\".\"N3\"||'-'||\"cenik\".\"N4\" ||'-'||\"cenik\".\"N5\"||'<p><b>'||\"cenik\".\"Opis\"||'</b></p>') AS \"Opis_z_naslovi\",\"cenik\".\"EM\",\"cenik\".\"Cena\",\"cenik\".\"Valuta\",\"cenik\".\"Fkor\",\"projektir12\".\"Projekt\",\"cenik\".\"cenaEUR\" FROM cenik, projektir12 WHERE \"cenik\".\"ID\" IN (SELECT DISTINCT ON (regexp_replace(\"cenik\".\"Opis\", E\'[\\\n\\\r]+\', \'\', \'g\' )) \"cenik\".\"ID\" FROM cenik, projektir12 WHERE (\"cenik\".\"Projekt\" = \"projektir12\".\"IDp\") AND (";
// ,\"cenik\".\"Kljuc\"
		for (i=0; i < vnosArr.length; i++) {
			if ( i > 0 ) {
				sqlQ += " AND";
			}
			sqlQ += " ((\"Opis\") LIKE ($" + (i+1) + ") OR (\"N1\") LIKE ($" + (i+1) + ") OR (\"N2\") LIKE ($" + (i+1) + ") OR (\"N3\") LIKE ($" + (i+1) + ") OR (\"N4\") LIKE ($" + (i+1) + ") OR (\"N5\") LIKE ($" + (i+1) + ") OR (\"projektir12\".\"Projekt\") LIKE ($" + (i+1) + "))";

			vnosArrSQL.push("%" + vnosArr[i] + "%");
		}

		sqlQ += ")) AND (\"cenik\".\"Projekt\" = \"projektir12\".\"IDp\") ORDER BY \"cenik\".\"cenaEUR\" DESC LIMIT " + limitRezultatov;
		// console.log(sqlQ);
		// var sqlVnos = "%" + vnos + "%";
	}

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		callback(rezultat);
	});
}

function Projekti(callback) {
	//console.log(vnos);
	var rezultat = "nič";	
	// var vnosArr = vnos.split('%20');
	//console.log(vnosArr);
	vnosArrSQL = [];

	var sqlQ = "SELECT \"Projekt\" FROM projektir12";

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		callback(rezultat);
	});
}

function Projekt(vnos, callback) {
	console.log(vnos);
	var rezultat = "nič";	
	// var vnosArr = vnos.split('%20');
	//console.log(vnosArr);
	vnosArrSQL = [vnos];

	var sqlQ = "SELECT \"Projekt\", \"INVESTOR\", \"TITLE-OFF\", \"CONTRACT-NO\", \"TYPE-OF-CONTRACT\", \"DESCRIPTION-OF-WORKS\",\"Type\",\"New-reconstruction\", \"Capacity\", \"Sewage-Length\", \"PS-wet\", \"PS-dry\", \"Other-objects\", \"CONTRACT-VALUE\", \"DATE-OF-SIGNING\", \"TOC\", \"PC\", \"ROLE\" FROM \"projektir12\" WHERE ((\"Projekt\") = ($1)) ORDER BY \"Projekt\"";

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		callback(rezultat);
	});
}



function Query (sqlSt, arrSpremenljivk, cb) {

	var config = {
		user: 'postgres', 				//env var: PGUSER 
		database: 'BazaCenikov', 		//env var: PGDATABASE 
		password: 'kookaburra@72', 		//env var: PGPASSWORD 
		host: 'kookaburra.si', 			// Server hosting the postgres database 
		port: 5432, 					//env var: PGPORT 
		max: 10, 						// max number of clients in the pool 
		idleTimeoutMillis: 30000 		// how long a client is allowed to remain idle before being closed 
	};


	// var client = new pg.Client(config);
	var pool = new pg.Pool(config);
	// client.connect(function (err) {
	pool.connect(function (err, client, done) {	
		if (err) {
			return console.error('napaka pri iskanju client iz pool-a', err);
		}
		
//	var query = client.query("SELECT * FROM cenik WHERE \"Opis\" LIKE $1", [sqlVnos], function(err, result){
	var kveri = client.query(sqlSt, arrSpremenljivk);
	// var kveri = client.query(new cursor(sqlSt, arrSpremenljivk));

	// kveri.read(200, function(err, rows){
	// 	if(err){
	// 		return done();
	// 	}

	// 	if(!rows.length){
	// 		cb('konec');
	// 		return done();
	// 	}

	// 	for (var i=0; i<200; i++) {
	// 		console.log(rows[i]);
	// 		cb(rows[i]);
	// 	}
	// });
	kveri.on('row', function(row){
		
		cb(row);
	});

	kveri.on('end', function(){
		done();
		// console.log('koncano');
		cb('konec');
	});



	// client.query(sqlSt, arrSpremenljivk, function(err, result){
	// 	done();
	// 	if(err) {
	//       return console.error('query ni uspel', err);
	//     }
	// 	var rezultat = JSON.stringify(result.rows, null, "   ");
	// 	cb(rezultat);
	// });

	pool.on('error', function(error) {
      console.log(error);
    });


	});
}

exports.Cenik = Cenik;
exports.Projekti = Projekti;
exports.Projekt = Projekt;