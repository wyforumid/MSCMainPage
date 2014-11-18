var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');
var mssql = require('mssql');
var _s = require('underscore.string')

exports.registUser = function(loginName, fullName, email, officeId, deptId, callback) {
	var params = [];
	params.push(new Parameter('fullName', mssql.VarChar(50), fullName));
	params.push(new Parameter('email', mssql.VarChar(200), email));
	params.push(new Parameter('loginName', mssql.VarChar(20), loginName));
	params.push(new Parameter('officeId', mssql.INT, officeId));
	params.push(new Parameter('deptId', mssql.INT, deptId));
	db.querySP('SP_RegistUser', params, callback);
}

exports.resetPassword = function(email, callback) {
	var params = [];
	params.push(new Parameter('email', mssql.NVarChar(200), email));
	db.querySP('SP_ResetPassword', params, callback);
}

exports.forceResetPassword = function(loginName, newPassword, callback) {
	var params = [];
	params.push(new Parameter('loginName', mssql.NVarChar(15), loginName));
	params.push(new Parameter('newPassword', mssql.NVarChar(32), newPassword));
	db.querySP('SP_ForceResetPassword', params, callback);
}

exports.login = function(userName, password,ip,callback){
	var params = [];
	params.push(new Parameter('userName',mssql.NVarChar(15),_s.trim(userName)));
	params.push(new Parameter('password',mssql.NVarChar(32),_s.trim(password)));
	params.push(new Parameter('ip',mssql.NVarChar(15),_s.trim(ip)));
	db.querySP('SP_GetUserPasswordByName',params, callback);
}