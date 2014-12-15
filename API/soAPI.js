var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');

exports.GetMainDisplaySORequest = function(userCacheId, callback) {

	var params = [];
	params.push(new Parameter('userCacheId', mssql.Int, userCacheId));
	db.querySP('SP_MainDisplaySORequest', params, callback);

}

exports.forceDispatch = function(dispatchInfo, callback) {
	if (dispatchInfo && dispatchInfo.length > 0) {
		var params = [];
		var t = new mssql.Table();
		t.columns.add('key1', mssql.Int);
		t.columns.add('key2', mssql.Int);
		for(var i = 0; i < dispatchInfo.length; i++){
			for(var k = 0; k < dispatchInfo[i].soRequestIds.length; k++){
				t.rows.add(dispatchInfo[i].groupId,dispatchInfo[i].soRequestIds[k]);
			}
		}

		params.push(new Parameter('dispatchInfo',mssql.TVP,t));
		db.querySP('SP_ForceDispatch', params, callback);
	}


}