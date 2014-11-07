var db = require('../DB/dbutil');
var Parameter = require('../DB/parameter');

exports.registUser = function(loginName,fullName,email,officeId,deptId,callback){
	var params = [];
	params.push(new Parameter('fullName',mssql.VarChar(50),fullName));
	params.push(new Parameter('email',mssql.VarChar(200),email));
	params.push(new Parameter('loginName',mssql.VarChar(20),loginName));
	params.push(new Parameter('officeId',mssql.INT,officeId));
	params.push(new Parameter('deptId',mssql.INT,deptId));
	db.querySP('SP_RegistUser',params,callback);
}