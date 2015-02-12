var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');
// var us = require('underscore');
var _ = require('underscore');
var _s = require('underscore.string')

exports.GetMainDisplaySORequest = function(userCacheId, callback) {

	var params = [];
	params.push(new Parameter('userId', mssql.Int, userCacheId));
	db.querySP('SP_MainDisplaySORequest', params, callback);

}

exports.searchSO = function(soId, bookingNo, inttraNo, sender, groupName, assignedUserName, service, por, pol, startDate, endDate, callback) {
	var params = [];
	var soId = parseInt(soId);
	if (!_.isNumber(soId)) {
		soId = null;
	}
	if(_s.isBlank(bookingNo)){
		bookingNo=null;
	}
	if(_s.isBlank(inttraNo)){
		inttraNo=null;
	}
	params.push(new Parameter('soId', mssql.Int, soId));
	params.push(new Parameter('bookingNo', mssql.VarChar(30), bookingNo));
	params.push(new Parameter('inttraNo', mssql.VarChar(30), inttraNo));
	params.push(new Parameter('sender', mssql.NVarChar(60), sender));
	params.push(new Parameter('dispathedGroupName', mssql.VarChar(60), groupName));
	params.push(new Parameter('assignedUserName', mssql.VarChar(60), assignedUserName));
	params.push(new Parameter('service', mssql.VarChar(60), service));
	params.push(new Parameter('por', mssql.VarChar(100), pol));
	params.push(new Parameter('pol', mssql.VarChar(35), pol));
	if (startDate) {
		params.push(new Parameter('startTime', mssql.DateTime, new Date(startDate)));
	} else {
		params.push(new Parameter('startTime', mssql.DateTime, null));
	}
	if (endDate) {
		params.push(new Parameter('endTime', mssql.DateTime, new Date(endDate)));
	} else {
		params.push(new Parameter('endTime', mssql.DateTime, null));
	}
	db.querySP('SP_SearchSO', params, callback);
}


exports.batchDispatch = function(dispatchInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(dispatchInfo);
	if (data == null) {
		callback('Dispatch information can\'t by analysed.', null);
		return;
	}

	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.TVP, data));
	params.push(new Parameter('statusType', mssql.Int, 2));

	db.querySP('SP_BatchChangeJobPackageStatus', params, callback);
}

exports.batchAssign = function(assignInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(assignInfo);
	if (data == null) {
		callback('Assign information can\'t by analysed.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.TVP, data));
	params.push(new Parameter('statusType', mssql.Int, 1));

	db.querySP('SP_BatchChangeJobPackageStatus', params, callback);
}

exports.soloDispatch = function(dispatchInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(dispatchInfo);
	if (data == null) {
		callback('Dispatch information can\'t by analysed.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.TVP, data));
	params.push(new Parameter('statusType', mssql.Int, 2));

	db.querySP('SP_SoloChangeJobPackageStatus', params, callback);
}

exports.soloAssign = function(assignInfo, userId, cacheId, callback) {
	var data = dispatchAssignTable(assignInfo);
	if (data == null) {
		callback('Assign information can\'t by analysed.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('statusInfo', mssql.TVP, data));
	params.push(new Parameter('statusType', mssql.Int, 1));

	db.querySP('SP_SoloChangeJobPackageStatus', params, callback);
}

exports.unassignSO = function(soRequestId, userId, callback) {
	var params = [];
	params.push(new Parameter('executorId', mssql.Int, userId));
	params.push(new Parameter('soRequestId', mssql.Int, soRequestId));
	db.querySP('SP_SoloUnassignSO', params, callback);
}

exports.GetSOWorkflow = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	// if (!us.isNumber(id)) {
	if (!_.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSOWorkFlow', params, callback);
}

exports.GetSOBaseInfo = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	//if (!us.isNumber(id)) {
	if (!_.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSOBaseInfo', params, callback);
}

exports.GetSORequestRelatedBookings = function(soRequestId, callback) {
	var id = parseInt(soRequestId);
	//if (!us.isNumber(id)) {
	if (!_.isNumber(id)) {
		callback('SO request Id \'' + soRequestId + '\' is not a number.', null);
		return;
	}
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, id));

	db.querySP('SP_GetSORequestRelatedBookings', params, callback);
}

exports.updateJobPackage = function(userId, data, callback) {
	var params = [];

	params.push(new Parameter('updateType', mssql.Int, data.typeId));
	params.push(new Parameter('soRequestId', mssql.Int, data.soRequestId));
	params.push(new Parameter('userId', mssql.Int, userId));
	params.push(new Parameter('filePath', mssql.NVarChar(2000), data.filePath));
	params.push(new Parameter('fileName', mssql.NVarChar(200), data.fileName));
	params.push(new Parameter('remark', mssql.VarChar(2000), data.remark));
	db.querySP('SP_SoloUpdateSOJobPackage', params, callback);
}

exports.getDispatchableGroup = function(userId, callback) {
	var params = [];
	params.push(new Parameter('userId', mssql.Int, userId));
	db.querySP('SP_GetDispatchableGroup', params, callback);
}

exports.getAssignableUser = function(userId, callback) {
	var params = [];
	params.push(new Parameter('userId', mssql.Int, userId));
	db.qureyMultipleSP('SP_GetAssignableUser', params, callback);
}

exports.getAssignedUsers = function(soRequestId, callback) {
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, soRequestId));
	db.querySP('SP_GetSOAssignedUsers', params, callback);
}

exports.getDispatchedGroupId = function(soRequestId, callback) {
	var params = [];
	params.push(new Parameter('soRequestId', mssql.Int, soRequestId));
	db.querySP('SP_GetSODispatchedGroup', params, callback);
}

function dispatchAssignTable(data) {
	if (data && data.length > 0) {
		var t = new mssql.Table();
		t.columns.add('key1', mssql.Int);
		t.columns.add('key2', mssql.Int);
		t.columns.add('key3', mssql.Int);
		if (_.isNumber(data[0].key)) {
			for (var i = 0; i < data.length; i++) {
				for (var k = 0; k < data[i].values.length; k++) {
					t.rows.add(data[i].key, data[i].values[k], -1);
				}
			}
		} else {
			for (var i = 0; i < data.length; i++) {
				for (var k = 0; k < data[i].values.length; k++) {
					t.rows.add(data[i].key.userId, data[i].key.groupId, data[i].values[k]);
				}
			}
		}

		return t;
	} else {
		return null;
	}
}