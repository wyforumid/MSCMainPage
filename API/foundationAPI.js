var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');

exports.autocompleteService = function(key, callback) {
	var params = [];
	params.push(new Parameter('key', mssql.VarChar(60), key));
	db.querySP('SP_Autocomplete_Service', params, callback);
}

exports.autocompleteGroup = function(key, callback) {
	var params = [];
	params.push(new Parameter('key', mssql.VarChar(60), key));
	db.querySP('SP_Autocomplete_Group', params, callback);
}

exports.autocompletePOL = function(key, callback) {
	var params = [];
	params.push(new Parameter('key', mssql.VarChar(60), key));
	db.querySP('SP_Autocomplete_POL', params, callback);
}

exports.autocompletePOR = function(key, callback) {
	var params = [];
	params.push(new Parameter('key', mssql.VarChar(60), key));
	db.querySP('SP_Autocomplete_POR', params, callback);
}

exports.autocompleteUser = function(key, callback) {
	var params = [];
	params.push(new Parameter('key', mssql.VarChar(60), key));
	db.querySP('SP_Autocomplete_User', params, callback);
}