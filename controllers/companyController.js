var companyAPI = require('../API/companyInfoAPI');
var async = require('async');


module.exports = function() {
	this.controllerName = 'company';

	this.GET = {
		ALLOFFICES: function(req, res, next) {
			getAPIData(req, res, function(cb) {
				companyAPI.getAllOffices(function(err, data) {
					cb(err, data);
				});
			});
		},
		ALLDEPTS: function(req, res, next) {
			getAPIData(req, res, function(cb) {
				companyAPI.getAllDepartments(function(err, data) {
					cb(err, data);
				});
			});
		}
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