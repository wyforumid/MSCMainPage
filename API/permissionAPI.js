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
	db.querySQL('SELECT PermissionCategoryid AS id, Name AS name, Description AS description FROM PermissionCategory',callback);
}

exports.getAllPermissions = function(callback){
	db.querySQL('SELECT PermissionId AS id, PermissionName AS name, Description AS description, PermissionCategoryid AS categoryId FROM Permission',callback);
}

exports.getOwnPermission = function(userId, callback) {
	var params = [];
	if (!userId) {
		return null;
	}
	params.push(new Parameter('userId', mssql.Int, userId));
	db.querySP('SP_GetOwnPermission', params, callback);
}

exports.searchUserByOfficeAndDepartment = function(officeId, departmentId, callback) {
	var params = [];
	params.push(new Parameter('OfficeId', mssql.Int, officeId));
	params.push(new Parameter('DepartmentId', mssql.Int, departmentId));
	db.querySP('SP_SearchUserByOfficeAndDepartment', params, callback);
}

exports.newGroup = function(newGroup, callback) {

}

exports.addPermissionCategory = function(categoryName, categoryDescription, callback) {
	var params = [];
	params.push(new Parameter('permissionCategoryName', mssql.NVarChar(60), categoryName));
	params.push(new Parameter('permissionCategoryDescription', mssql.NVarChar(255), categoryDescription));
	db.querySP('SP_AddCategory', params, callback);
}