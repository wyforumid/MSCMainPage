var db = require('../DB/dbutil');

exports.getAllOffices = function(callback){
	db.querySQL('SELECT OfficeId AS id,OfficeName AS name FROM Offices',callback);
}

exports.getAllDepartments = function(callback){
	db.querySQL('SELECT DepartmentId AS id,DepartmentName AS name FROM Departments',callback);	
}