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

exports.getAllPermissionCategories = function(callback) {
	db.querySQL('SELECT PermissionCategoryid AS id, Name AS name, Description AS description FROM PermissionCategory', callback);
}

exports.getAllPermissions = function(callback) {
	db.querySQL('SELECT PermissionId AS id, PermissionName AS name, Description AS description, PermissionCategoryid AS categoryId FROM Permission', callback);
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

exports.newGroup = function(newGroup, userCacheId, callback) {

	var groupName = newGroup.name;

	var officeDept = new mssql.Table();
	officeDept.columns.add('OfficeId', mssql.Int);
	officeDept.columns.add('DeptId', mssql.Int);

	var userGroupRole = new mssql.Table();
	userGroupRole.columns.add('RoleName', mssql.NVarChar(60));
	userGroupRole.columns.add('UserId', mssql.Int);

	var rolePermission = new mssql.Table();
	rolePermission.columns.add('RoleName', mssql.NVarChar(60));
	rolePermission.columns.add('PermissionId', mssql.Int);

	for (var i = newGroup.departmentGroup.length; i--;) {
		officeDept.rows.add(newGroup.departmentGroup[i].officeId, newGroup.departmentGroup[i].departmentId);
	}

	for (var i = newGroup.roles.length; i--;) {
		for (var j = newGroup.roles[i].userIds.length; j--;) {
			userGroupRole.rows.add(newGroup.roles[i].name, newGroup.roles[i].userIds[j]);
		}

		for (var j = newGroup.roles[i].permissionIds.length; j--;) {
			rolePermission.rows.add(newGroup.roles[i].name, newGroup.roles[i].permissionIds[j]);
		}
	}

	var params = [];

	params.push(new Parameter('groupName', mssql.NVarChar(60), groupName));
	params.push(new Parameter('userCacheId', mssql.UniqueIdentifier, userCacheId));
	params.push(new Parameter('officeDept', mssql.TVP, officeDept));
	params.push(new Parameter('roles', mssql.TVP, userGroupRole));
	params.push(new Parameter('permission', mssql.TVP, rolePermission));

	db.querySP('SP_AddGroup', params, callback);
}

exports.addPermissionCategory = function(categoryName, categoryDescription, callback) {
	var params = [];
	params.push(new Parameter('permissionCategoryName', mssql.NVarChar(60), categoryName));
	params.push(new Parameter('permissionCategoryDescription', mssql.NVarChar(255), categoryDescription));
	db.querySP('SP_AddCategory', params, callback);
}

exports.modifyPermission = function(permissionId, permissionName, description, permissionCategoryId, callback) {
	var params = [];
	params.push(new Parameter('permissionId', mssql.Int, permissionId));
	params.push(new Parameter('permissionName', mssql.NVarChar(60), permissionName));
	params.push(new Parameter('description', mssql.NVarChar(255), description));
	params.push(new Parameter('permissionCategoryId', mssql.Int, permissionCategoryId));
	db.querySP('SP_ModifyPermission', params, callback);
}

exports.addPermission = function(permissionName, description, permissionCategoryId, callback) {
	var params = [];
	params.push(new Parameter('permissionName', mssql.NVarChar(60), permissionName));
	params.push(new Parameter('description', mssql.NVarChar(255), description));
	params.push(new Parameter('permissionCategoryId', mssql.Int, permissionCategoryId));
	db.querySP('SP_AddPermission', params, callback);
}

exports.getGroupsByUserId = function(userId, callback) {
	var params = [];
	params.push(new Parameter('userId', mssql.Int, userId));
	db.querySP('SP_GetGroupByUserId', params, callback);
}

exports.getGroupRelationbyGroupId = function(groupId, callback) {
	var params = [];
	params.push(new Parameter('groupId', mssql.Int, groupId));
	db.querySP('SP_GetRelationbyGroupId', params, callback)
}
