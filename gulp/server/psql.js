// var gulp = require('gulp'),
// var cursor = require('pg-cursor');
var pg = require('pg') ;


//Psql.prototype.poizvedba = 
function Cenik(vnos, kljukicaCena, callback) {
	var rezultat = "nič";
	var limitRezultatov = 200;
	var vnosArr = vnos;
	vnosArrSQL = [];
	var sqlQ = 'SELECT "Poz", (\'<div class="table--td--postavka"><div class="table--td--naslov">\'||"N1"||\'-\'||"N2"||\'-\'||"N3"||\'-\'||"N4" ||\'-\'||"N5"||\'</div><div class="table--td--opis">\'||"Opis"||\'</div></div>\') AS "Opis_z_naslovi", "EM", ("Cena"||\' \'||"Valuta") AS "CenaV", "Fkor", "cenaEUR", "projektir12"."Projekt" FROM "public"."cenik" INNER JOIN "public"."projektir12" ON "cenik"."Projekt" = "projektir12"."IDp" WHERE (';
	sqlQ=sqlQ.replace(RegExp(/"/gi), '\"');


	if (kljukicaCena == 0){
//DISTINCT ON (regexp_replace(\"cenik\".\"Opis\", E\'[\\\n\\\r]+\', \'\', \'g\' ))
		for (i=0; i < vnosArr.length; i++) {
			if ( i > 0 ) {
				sqlQ += " AND";
			}
			sqlQ += " (LOWER(\"N1\"||\"N2\"||\"N3\"||\"N4\"||\"N5\"||\"Opis\") ~~ LOWER($" + (i+1) + ") OR LOWER(\"projektir12\".\"Projekt\") ~~ LOWER($" + (i+1) + "))";

			vnosArrSQL.push("%" + vnosArr[i] + "%");
		}

		sqlQ += ") GROUP BY \"Opis\", \"N1\",  \"N2\", \"N3\", \"N4\", \"N5\", \"projektir12\".\"Projekt\", \"Poz\", \"EM\", \"cenaEUR\", \"Cena\", \"Valuta\", \"Fkor\" LIMIT " + limitRezultatov;

	} else if (kljukicaCena == 1){
		
//DISTINCT ON (regexp_replace(\"cenik\".\"Opis\", E\'[\\\n\\\r]+\', \'\', \'g\' ))
		for (i=0; i < vnosArr.length; i++) {
			if ( i > 0 ) {
				sqlQ += " AND";
			}
			sqlQ += " (LOWER(\"N1\"||\"N2\"||\"N3\"||\"N4\"||\"N5\"||\"Opis\") LIKE LOWER($" + (i+1) + ") OR LOWER(\"projektir12\".\"Projekt\") LIKE LOWER($" + (i+1) + "))";

			vnosArrSQL.push("%" + vnosArr[i] + "%");
		}

		sqlQ += ") GROUP BY \"cenaEUR\", \"Opis\", \"N1\",  \"N2\", \"N3\", \"N4\", \"N5\", \"projektir12\".\"Projekt\", \"Poz\", \"EM\", \"Cena\", \"Valuta\", \"Fkor\" ORDER BY \"cenaEUR\" ASC LIMIT " + limitRezultatov;
	}

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		callback(rezultat);
	});
}

function Projekti(callback) {
	var rezultat = "nič";	
	vnosArrSQL = [];

	var sqlQ = "SELECT \"Projekt\" FROM projektir12";

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		callback(rezultat);
	});
}

function Projekt(vnos, callback) {
	
	var rezultat = "nič";	
	vnosArrSQL = [vnos];
	// console.log(vnosArrSQL);
	var sqlQ = "SELECT \"Projekt\", \"INVESTOR\", \"TITLE-OFF\", \"CONTRACT-NO\", \"TYPE-OF-CONTRACT\", \"DESCRIPTION-OF-WORKS\",\"Type\",\"New-reconstruction\", \"Capacity\", \"Sewage-Length\", \"PS-wet\", \"PS-dry\", \"Other-objects\", \"CONTRACT-VALUE\", \"DATE-OF-SIGNING\", \"TOC\", \"PC\", \"ROLE\" FROM \"projektir12\" WHERE (LOWER(\"Projekt\") = ($1)) ORDER BY \"Projekt\"";

	Query(sqlQ, vnosArrSQL, function(rezultat) {
		// console.log('tle: ' + rezultat);
		callback(rezultat);
	});
}

function vodovodKoroska(sklop, NOTsklop, tekst, callback) {
	
	var rezultat = "nič";	

	// console.log('vars: ' + sklop + tekst);

	var sqlQ = "SELECT wbs, opis, replace(cena_pon_brez_pop::text, '.', ',') AS cena, round(similarity(opis, '" + tekst + "')::numeric ,2) AS podobnost FROM expert WHERE opis % '" + tekst + "' AND wbs LIKE '" + sklop + "%' AND wbs NOT LIKE '" + NOTsklop + "' ORDER BY podobnost DESC LIMIT 10";

	let sqlqMaxPodobnost = "SELECT MAX(round(similarity(opis, '" + tekst + "')::numeric ,2)) FROM expert WHERE opis % '" + tekst + "' AND wbs LIKE '" + sklop + "%' AND wbs NOT LIKE '" + NOTsklop + "'";

	let sqlMaxCena = "SELECT replace(MAX(cena_pon_brez_pop)::text, '.', ',') FROM expert WHERE opis % '" + tekst + "' AND wbs LIKE '" + sklop + "%' AND wbs NOT LIKE '" + NOTsklop + "' AND similarity(opis, '" + tekst + "') > 0.5";

	let povpCena = "SELECT replace(round(AVG(cena_pon_brez_pop)::numeric, 2)::text, '.', ',') FROM expert WHERE opis % '" + tekst + "' AND wbs LIKE '" + sklop + "%' AND wbs NOT LIKE '" + NOTsklop + "' AND similarity(opis, '" + tekst + "') = 1";

	let razlagaSQL = "SELECT (" + sqlqMaxPodobnost + ") as max_podobnost, (" + sqlMaxCena + ") as max_cena, (" + povpCena + ") AS povp_cena ";
// tle sem končal - naredi novo poizvedbo za določitev treh količin .. max cena, podobnost, avg cena ...
	VodovodKoroskaQuery(sqlQ, function(rezultat) {
		// console.log('tle: ' + rezultat);
		callback(rezultat);
	});

	VodovodKoroskaQuery(razlagaSQL, function(rezultat) {
		let razlaga = {};

		Object.assign(razlaga, rezultat);

		if (rezultat == 'konec') {
			callback(rezultat);
		} else {
			callback({razlaga: razlaga});
			// callback({maxPodobnost: rezultat.max_podobnost});
		}
	});
}



function Query (sqlSt, arrSpremenljivk, cb) {
	var config = {
		user: 'postgres', 				//env var: PGUSER 
		database: 'BazaCenikov', 		//env var: PGDATABASE 
		password: 'postgres', 		//env var: PGPASSWORD 
		host: 'localhost', 			// Server hosting the postgres database 
		port: 5432, 					//env var: PGPORT 
		max: 10, 						// max number of clients in the pool 
		idleTimeoutMillis: 30000 		// how long a client is allowed to remain idle before being closed 
	};


	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {	
		if (err) {
			return console.error('napaka pri iskanju client iz pool-a', err);
		}
	// console.log(arrSpremenljivk);
	var kveri = client.query(sqlSt, arrSpremenljivk);
	kveri.on('row', function(row){
		// console.log('tukaj: ' + row);
		cb(row);
	});

	kveri.on('end', function(){
		done();
		cb('konec');
	});

	pool.on('error', function(error) {
      console.log(error);
    });


	});
}

function VodovodKoroskaQuery (sqlSt, cb) {
	var config = {
		user: 'postgres', 				//env var: PGUSER 
		database: 'vodovod_koroska', 		//env var: PGDATABASE 
		password: 'postgres', 		//env var: PGPASSWORD 
		host: 'localhost', 			// Server hosting the postgres database 
		port: 5432, 					//env var: PGPORT 
		max: 10, 						// max number of clients in the pool 
		idleTimeoutMillis: 30000 		// how long a client is allowed to remain idle before being closed 
	};


	var pool = new pg.Pool(config);
	pool.connect(function (err, client, done) {	
		if (err) {
			return console.error('napaka pri iskanju client iz pool-a', err);
		}
	// console.log(arrSpremenljivk);
	var kveri = client.query(sqlSt);
	
	kveri.on('row', function(row){
		// console.log('tukaj: ' + row);
		cb(row);
	});

	kveri.on('end', function(){
		done();
		cb('konec');
	});

	pool.on('error', function(error) {
      console.log(error);
    });


	});
}

exports.Cenik = Cenik;
exports.Projekti = Projekti;
exports.Projekt = Projekt;
exports.vodovodKoroska = vodovodKoroska;