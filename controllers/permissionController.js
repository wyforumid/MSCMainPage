var permissionAPI = require('../API/permissionAPI');
var async = require('async');

module.exports = function() {
	this.controllerName = 'permission';

	this.GET = {
		CONCERNEDGROUPNAMES: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getConcernedGroupNames(JSON.parse(req.query.info), function(err, data) {
					cb(err, data);
				});
			});
		},
		ALLPERMISSIONS: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getAllPermissions(function(err, data) {
					cb(err, data);
				});
			});
		},
		ALLPERMISSIONCATEGORIES: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getAllPermissionCategories(function(err, data) {
					cb(err, data);
				});
			});
		},
		OWNPERMISSIONS: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getOwnPermission(req.query.id, function(err, data) {
					cb(err, data);
				})
			});
		},
		SEARCHUSERBYOFFICEANDDEPARTMENT: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.searchUserByOfficeAndDepartment(req.query.officeId, req.query.departmentId, function(err, data) {
					cb(err, data);
				})
			});
		}
	};

	this.POST = {};

	this.PUT = {};

	this.DELETE = {};

	function getAPIData(req, res, getFunc) {
		async.waterfall([
				function(cb) {
					getFunc(cb);
				},
				function(data, cb) {
					res.writeHead(200, {
						"Content-Type": "application/json"
					});
					res.write(JSON.stringify(data));
					res.end();
				}
			],
			function(err, result) {
				res.writeHead(404);
				res.write(err ? err.toString() : '');
				res.end();
			});
	}
}