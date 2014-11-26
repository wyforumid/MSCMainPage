var db = require('../DB/dbutil');

exports.getAllOffices = function(callback) {
	db.querySQL('SELECT Office_Id AS id,Office_Name AS name FROM Office ORDER BY Office_Name', callback);
}

exports.getAllDepartments = function(callback) {
	db.querySQL('SELECT Department_Id AS id,Department_Name AS name FROM Department ORDER BY Department_Name', callback);
}