var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');
var us = require('underscore');

exports.GetMainDisplaySORequest = function(userCacheId, callback) {

	var params = [];
	params.push(new Parameter('userId', mssql.Int, userCacheId));
	db.querySP('SP_MainDisplaySORequest', params, callback);

}

exports.forceDispatch = function(dispatchInfo, callback) {
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

exports.dispatch = function(dispatchInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(dispatchInfo);
	if (data == null) {
		callback('Dispatch information can\'t by analysed.', null);
		return;
	}

	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('cacheId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.Int, data));
	params.push(new Parameter('statusType', mssql.Int, 2));

	db.querySP('SP_BatchChangeJobPackageStatus', params, callback);
}

exports.assign = function(assignInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(assignInfo);
	if (data == null) {
		callback('Assign information can\'t by analysed.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('cacheId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.Int, data));
	params.push(new Parameter('statusType', mssql.Int, 1));

	db.querySP('SP_BatchChangeJobPackageStatus', params, callback);
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



exports.GetSOWorkflow = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	if (!us.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSOWorkFlow', params, callback);
}

exports.GetSOBaseInfo = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	if (!us.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSOBaseInfo', params, callback);
}

exports.GetSORequestRelatedBookings = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	if (!us.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSORequestRelatedBookings', params, callback);
}

exports.insertAttachmentToDB = function(relativeFilePath, callback) {
	var params = [];
	params.push(new Parameter('relativeFilePath', mssql.NVarChar(500), relativeFilePath));
	params.push(new Parameter('note', mssql.VarChar(500), 'update'));
	db.querySP('SP_SaveSOSupportingFile', params, callback);
}

exports.updateJobPackage = function(data, callback) {
	var params = [];
	params.push(new Parameter('soJobPackageId', mssql.Int, data.soRequestId));
	params.push(new Parameter('executeeId', mssql.Int, data.executeeId));
	params.push(new Parameter('executeeTypeId', mssql.Int, data.executeeTypeId));
	params.push(new Parameter('executorId', mssql.Int, data.executorId));
	params.push(new Parameter('statusId', mssql.Int, data.statusId));
	params.push(new Parameter('remark', mssql.VarChar(2000), data.remark));
	params.push(new Parameter('filePath', mssql.NVarChar(500), data.filePath));
	db.querySP('SP_UpdateJobPackage', params, callback);
}

exports.getDispatchableGroup = function(userId, callback) {
	var params = [];
	params.push(new Parameter('userId', mssql.Int, userId));
	db.querySP('SP_GetDispatchableGroup', params, callback);
}

exports.getAssignableUser = function(userId,callback){
	var params = [];
	params.push(new Parameter('userId', mssql.Int, userId));
	db.qureyMultipleSP('SP_GetAssignableUser', params, callback);	
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