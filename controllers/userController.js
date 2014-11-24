var userAPI = require('../API/userAPI');
var async = require('async');

module.exports = function() {
	this.controllerName = 'user';

	this.GET = {

	};

	this.POST = {
		REGIST: function(req, res) {
			getAPIData(req, res, function(cb) {
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
		}
	};

	this.PUT = {
			
	};

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