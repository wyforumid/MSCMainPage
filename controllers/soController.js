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
		},
		GETASSIGNEDUSERS: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				soAPI.getAssignedUsers(req.query.id, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		GETDISPATCHEDGROUP: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				soAPI.getDispatchedGroupId(req.query.id, function(err, data) {
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
		FORCEBATCHDISPATCH: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				// soAPI.forceDispatch(req.body, function(err, data) {
				// 	try {
				// 		callback(err, data);
				// 	} catch (ex) {
				// 		callback(ex, data);
				// 	}
				// });
				var userInfo = req.getUserInfo();
				soAPI.batchDispatch(req.body, userInfo.userId, userInfo.cacheId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		FORCEBATCHASSIGN: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.batchAssign(req.body, userInfo.userId, userInfo.cacheId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			})
		},
		FORCESOLODISPATCH: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.soloDispatch(req.body, userInfo.userId, userInfo.cacheId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			})
		},
		FORCESOLOASSIGN: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.soloAssign(req.body, userInfo.userId, userInfo.cacheId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			})
		},
		SOLOUNASSIGN: function(req, res) {
			func.jsonResponse(req, res, function(callback) {
				var userInfo = req.getUserInfo();
				soAPI.unassignSO(req.query.id, userInfo.userId, function(err, data) {
					try {
						callback(err, data);
					} catch (ex) {
						callback(ex, data);
					}
				});
			});
		},
		UPLOADWORKFLOWFILE: function(req, res) {
			var form = func.multiparty();
			async.waterfall([
				function(cb) {
					try {
						form.parse(req, function(err, fields, files) {
							if (_.isArray(files.file) && files.file.length >= 1) {
								if (fields && fields.soRequestId && fields.soRequestId[0] && fields.typeId && fields.typeId[0]) {
									var requestInfo = {
										soRequestId: fields.soRequestId[0],
										typeId: fields.typeId[0],
										remark: (fields.remark && fields.remark[0]) ? fields.remark[0] : '',
										fileTempPath: files.file[0].path,
										fileName: files.file[0].originalFilename,
										filePath: ''
									}
									func.moveFileToTargetFolder(requestInfo, cb);

								} else {
									cb('some information is missing. Please try to post again, thanks.', null);
								}

							} else {
								cb(err, null);
							}
						});
					} catch (ex) {
						cb(ex, null);
					}
				},

			], function(err, result) {
				func.jsonResponse(req, res, function(cb) {
					var userInfo = req.getUserInfo();
					soAPI.updateJobPackage(userInfo.userId, result, function(err, data) {
						try {
							cb(err, data);
						} catch (ex) {
							cb(ex, data);
						}
					});
				});
			});
		},
		ADDWORKFLOW: function(req, res) {

		},
		UPDATEWORKFLOW: function(req, res) {
			var userInfo = req.getUserInfo();
			func.jsonResponse(req, res, function(cb) {
				soAPI.updateJobPackage(userInfo.userId, req.body, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
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