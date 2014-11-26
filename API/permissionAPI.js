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
	db.querySQL('SELECT Permission_Category_id AS id, Name AS name, Description AS description FROM Permission_Category',callback);
}

exports.getAllPermissions = function(callback){
	db.querySQL('SELECT Permission_Id AS id, Permission_Name AS name, Description AS description, Permission_Category_id AS categoryId FROM Permission',callback);
}

exports.getOwnPermission = function(userId, callback){
	var params = [];
	if(!userId){
		return null;
	}
	params.push(new Parameter('userId',mssql.Int,userId));
	db.querySP('SP_GetOwnPermission',params,callback);
}