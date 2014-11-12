var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');

exports.getConcernedGroupNames = function(info, callback) {
	var params = [];
	if (!info || info.length == 0) {
		return null;
	} else {
		var t = new mssql.Table();
		t.columns.add('OfficeId', mssql.Int);
		t.columns.add('DeptId', mssql.Int);

		for (var i = info.length; i--;) {
			t.rows.add(info[i].office.id, info[i].dept.id);
		}

		params.push(new Parameter('officeDept', mssql.TVP, t));
		db.querySP('SP_GetConcernedGroupName', params, callback);
	}
}

exports.getAllPermissionCategories = function(callback){
	db.querySQL('SELECT * FROM PermissionCategories',callback);
}

exports.getAllPermissions = function(callback){
	db.querySQL('SELECT * FROM Permissions',callback);
}