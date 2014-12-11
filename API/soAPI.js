var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');

exports.GetMainDisplaySORequest = function(userCacheId,callback){
	if(userCacheId <= 0){
		return null;
	}

	var params = [];
	params.push(new Parameter('userCacheId',mssql.Int,userCacheId));
	db.querySP('SP_MainDisplaySORequest',params,callback);

}