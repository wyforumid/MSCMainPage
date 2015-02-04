var permissionAPI = require('../API/permissionAPI');
var async = require('async');
var func = require('./func');

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
		},
		GROUPLISTBYUSERID: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getGroupsByUserId(req.query.userId, function(err, data) {
					cb(err, data);
				})
			});
		},
		GROUPRELATION: function(req, res) {
			getAPIData(req, res, function(cb) {
				permissionAPI.getGroupRelation(req.query.groupId, req.query.userId, function(err, data) {
					cb(err, data);
				})
			});
		}
	};

	this.POST = {
		ADDGROUP: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				permissionAPI.newGroup(req.body.newGroup, req.getUserInfo().cacheId, function(err, data) {
					callback(err, data);
				});
			});
		},
		ADDCATEGORY: function(req, res) {

			async.waterfall([
				function(callback) {
					permissionAPI.addPermissionCategory(req.body.categoryName, req.body.categoryDescription, callback);
				},
				function(data, callback) {
					res.writeHead(200, {
						"Content-Type": "application/json"
					});
					res.write(JSON.stringify(data));
					res.end();
				}
			], function(error, result) {
				res.writeHead(404);
				res.write(error ? error.toString() : '');
				res.end();
			});
		},
		MODIFYPERMISSION: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				permissionAPI.modifyPermission(
					req.body.modifyPermission.id, req.body.modifyPermission.name, req.body.modifyPermission.description, req.body.modifyPermission.categoryId,
					function(err, data) {
						callback(err, data);
					});
			});
		},
		ADDPERMISSION: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				permissionAPI.addPermission(
					req.body.addPermission.name, req.body.addPermission.description, req.body.addPermission.categoryId,
					function(err, data) {
						callback(err, data);
					});
			});
		},
		MODIFYGROUP: function(req, res) {
			func.jsonResponse(req, res, function(callback) {

				permissionAPI.modifyGroup(req.body.modifyGroup, req.body.userId, function(err, data) {
					callback(err, data);
				});

			});
		}
	};

	this.PUT = {};

	this.DELETE = {};


	function errorOccurred(request, response, error, result) {
		response.writeHead(404);
		response.write(error ? error.toString() : '');
		response.end();
	}


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