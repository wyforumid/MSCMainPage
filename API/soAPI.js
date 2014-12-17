var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');

exports.GetMainDisplaySORequest = function(userCacheId, callback) {

	var params = [];
	params.push(new Parameter('userCacheId', mssql.Int, userCacheId));
	db.querySP('SP_MainDisplaySORequest', params, callback);

}

exports.forceDispatch = function(dispatchInfo, callback) {
	// if (dispatchInfo && dispatchInfo.length > 0) {
	// 	var params = [];
	// 	var t = new mssql.Table();
	// 	t.columns.add('key1', mssql.Int);
	// 	t.columns.add('key2', mssql.Int);
	// 	for(var i = 0; i < dispatchInfo.length; i++){
	// 		for(var k = 0; k < dispatchInfo[i].soRequestIds.length; k++){
	// 			t.rows.add(dispatchInfo[i].groupId,dispatchInfo[i].soRequestIds[k]);
	// 		}
	// 	}

	// 	params.push(new Parameter('dispatchInfo',mssql.TVP,t));
	// 	db.querySP('SP_ForceDispatchAssign', params, callback);
	// }

	var data = dispatchAssignTable(dispatchInfo);
	if (data == null) {
		callback('Dispatch information can\'t by analysed.', null);
		return;
	}

	var params = [];
	params.push(new Parameter('Info', mssql.TVP, data));
	params.push(new Parameter('isDispatch', mssql.Bit, true));

	db.querySP('SP_ForceDispatchAssign', params, callback);

}

exports.forceAssign = function(assignInfo, callback) {
	var data = dispatchAssignTable(assignInfo);
	if (data == null) {
		callback('Assign information can\'t by analysed.', null);
		return;
	}

	var params = [];
	params.push(new Parameter('Info', mssql.TVP, data));
	params.push(new Parameter('isDispatch', mssql.Bit, false));

	db.querySP('SP_ForceDispatchAssign', params, callback);

}

function dispatchAssignTable(data) {
	if (data && data.length > 0) {
		var t = new mssql.Table();
		t.columns.add('key1', mssql.Int);
		t.columns.add('key2', mssql.Int);
		for (var i = 0; i < data.length; i++) {
			for (var k = 0; k < data[i].values.length; k++) {
				t.rows.add(data[i].key, data[i].values[k]);
			}
		}
		return t;
	} else {
		return null;
	}
}