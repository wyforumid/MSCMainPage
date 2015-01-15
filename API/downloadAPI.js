var db = require('../DB/dbutil');
var mssql = require('mssql');
var Parameter = require('../DB/parameter');

exports.getSOSupportingFileAddress = function(id, callback) {
	var params = [];

	params.push(new Parameter('id', mssql.INT, id));
	db.querySP('SP_GETSOSupportingFilePath', params, callback);
}