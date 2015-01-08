var func = require('./func');
var soAPI = require('../API/soAPI');
var multiparty = require('multiparty');
var async = require('async');
var _ = require('underscore');

module.exports = function() {
	this.controllerName = 'so';

	this.GET = {
		GETMAINSOREQUEST: function(req, res) {
			func.getData(req, res, function(cb) {
				var userInfo = req.getUserInfo();
				if (userInfo) {
					soAPI.GetMainDisplaySORequest(userInfo.userId, function(err, data) {
						try {
							cb(err, data);
						} catch (ex) {
							cb(ex, data);
						}
					});
				} else {
					// cb('Please login first', null);
					res.redirect('/');
				}

			});
		},
		GETSOWORKFLOW: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				soAPI.GetSOWorkflow(req.query.id, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		GETSOBASEINFO: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				soAPI.GetSOBaseInfo(req.query.id, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		GETRELATEDBOOKINGS: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				soAPI.GetSORequestRelatedBookings(req.query.id, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		GETDISPATCHABLEGROUP: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.getDispatchableGroup(userInfo.userId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		GETASSIGNABLEUSER: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.getAssignableUser(userInfo.userId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		}
	}

	this.POST = {
		FORCEDISPATCH: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				// soAPI.forceDispatch(req.body, function(err, data) {
				// 	try {
				// 		callback(err, data);
				// 	} catch (ex) {
				// 		callback(ex, data);
				// 	}
				// });
				var userInfo = req.getUserInfo();
				soAPI.dispatch(req.body, req.cookies.userInfo.userId, JSON.parse(userInfo), function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		FORCEASSIGN: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				// soAPI.forceAssign(req.body, function(err, data) {
				// 	try {
				// 		callback(err, data);
				// 	} catch (ex) {
				// 		callback(ex, data);
				// 	}
				// })
				var userInfo = req.getUserInfo();
				soAPI.assign(req.body, req.cookies.userInfo.userId, JSON.parse(userInfo), function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			})
		},
		UPLOADWORKFLOWFILE: function(req, res) {
			var form = func.multiparty();
			async.waterfall([
				function(cb) {
					form.parse(req, function(err, fields, files) {
						if (_.isArray(files.file) && files.file.length >= 1) {
							cb(null, files.file[0]);
						} else {
							cb(err, null);
						}
					})
				},
				function(data, cb) {
					func.moveFileToTargetFolder(data.path, data.originalFilename, cb);
				},
				function(data, cb) {
					soAPI.insertAttachmentToDB(func.generalRelativeFilePath(data), cb);
				}
			], function(err, result) {
				func.jsonResponse(req, res, function(cb) {
					cb(null, result[0].id);
				});
			});
		},
		ADDWORKFLOW: function(req, res) {

		},
		UPDATEWORKFLOW: function(req, res) {
			req.body.filePath = null;
			func.jsonResponse(req, res, function(cb) {
				soAPI.updateJobPackage(req.body, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				})
			});
		},
		UPDATEWORKFLOWWITHFILE: function(req, res) {

		}
	};

	this.PUT = {};

	this.DELETE = {};
}

function addWorkflow(req, res, soSupportingFileId) {

}