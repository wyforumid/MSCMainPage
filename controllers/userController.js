var userAPI = require('../API/userAPI');
var func = require('./func');
var async = require('async');


module.exports = function() {
	this.controllerName = 'user';

	this.GET = {

	};

	this.POST = {
		REGIST: function(req, res) {
			func.jsonResponse(req, res, function(cb) {
				userAPI.registUser(
					req.body.loginName,
					req.body.fullName,
					req.body.email,
					req.body.office.id,
					req.body.dept.id,
					function(err, data) {
						try {
							cb(err, data);
						} catch (e) {
							cb(e, data);
						}

					}
				);
			})
		},
		RESETPWD: function(req, res) {
			resetPassword(req, res);
		},
		MODIFYPWD: function(req, res) {
			resetPassword(req, res);
		}
	};

	// this.PUT = {
	// 	RESETPWD: function(req, res) {
	// 		resetPassword(req, res);
	// 	}
	// };


	function resetPassword(req, res) {

		switch (req.body.updateMode.toUpperCase()) {
			case "FORCE":
				func.jsonResponse(req, res, function(callback) {
					userAPI.forceResetPassword(req.body.user.loginName, req.body.user.newPassword,
						function(err, data) {
							try {
								callback(err, data);
							} catch (e) {
								callback(e, data);
							}
						}
					);
				});

				// getAPIData(req, res, function(cb) {
				// 	userAPI.forceResetPassword(req.body.user.loginName, req.body.user.newPassword,
				// 		function(err, data) {
				// 			try {
				// 				cb(err, data);
				// 			} catch (e) {
				// 				cb(e, data);
				// 			}
				// 		}
				// 	);
				// });
				break;
			case "PASSWORD":

				func.jsonResponse(req, res, function(callback) {
					userAPI.resetPassword(req.body.user.email, function(err, data) {
						try {
							callback(err, data);
						} catch (e) {
							callback(e, data);
						}
					});
				});

				// getAPIData(req, res, function(cb) {
				// 	userAPI.resetPassword(req.body.user.email, function(err, data) {
				// 		try {
				// 			cb(err, data);
				// 		} catch (e) {
				// 			cb(e, data);
				// 		}
				// 	});
				// });
				break;
			case "ALL":

				break;
		}

	}

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



// exports.resetPassword = function(req, res) {
// 	switch (req.body.updateMode.toUpperCase()) {
// 		case "FORCE":
// 			func.jsonResponse(req, res, function(callback) {
// 				userAPI.forceResetPassword(req.body.user.loginName, req.body.user.newPassword,
// 					function(err, data) {
// 						try {
// 							callback(err, data);
// 						} catch (e) {
// 							callback(e, data);
// 						}
// 					}
// 				);
// 			});
// 			break;
// 		case "PASSWORD":
// 			func.jsonResponse(req, res, function(callback) {
// 				userAPI.resetPassword(req.body.user.email, function(err, data) {
// 					try {
// 						callback(err, data);
// 					} catch (e) {
// 						callback(e, data);
// 					}
// 				});
// 			});
// 			break;
// 		case "ALL":
// 			break;
// 	}
// }

// exports.registerUser = function(req, res) {
// 	func.jsonResponse(req, res, function(callback) {
// 		userAPI.registUser(
// 			req.body.loginName,
// 			req.body.fullName,
// 			req.body.email,
// 			req.body.office.id,
// 			req.body.dept.id,
// 			function(err, data) {
// 				try {
// 					callback(err, data);
// 				} catch (e) {
// 					callback(e, data);
// 				}
// 			}
// 		);
// 	});
// }