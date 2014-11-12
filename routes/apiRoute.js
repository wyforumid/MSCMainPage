var express = require('express');
var async = require('async');
var router = express.Router();
var companyAPI = require('../API/companyInfoAPI');
var userAPI = require('../API/userAPI');
var permissionAPI = require('../API/permissionAPI');

router.route('/')
.get(function(req,res,next){
	req.params.info;
	next();
})

router.route('/company/:actionName')
	.get(function(req, res, next) {
		switch (req.params.actionName.toUpperCase()) {
			case 'ALLOFFICES':
				getAllOffices(req, res);
				break;
			case 'ALLDEPTS':
				getAllDepts(req, res);
				break;
			default:
				res.response.writeHead(404);
				res.write();
				res.end();
		}
	});

router.route('/user')
	.get(function(req, res, next) {

	})
	.post(function(req, res, next) {
		registUser(req, res);
	});

module.exports = router;


function registUser(req, res) {
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

router.route('/permission/:actionName')
.get(function(req,res,next){
	switch(req.params.actionName.toUpperCase()){
		case 'CONCERNEDGROUPNAMES':
			getConcernedGroupNames(req,res);
			break;
		case 'ALLPERMISSIONS':
			getAllPermissions(req,res);
			break;
		case 'ALLPERMISSIONCATEGORIES':
			getAllPermissionCategories(req,res);
			break;
		default:
			res.response.writeHead(404);
			res.write();
			res.end();
	}
});

function getAllPermissions(req,res){
	getAPIData(req,res,function(cb){
		permissionAPI.getAllPermissions(function(err,data){
			cb(err,data);
		});
	});
}

function getAllPermissionCategories(req,res){
	getAPIData(req,res,function(cb){
		permissionAPI.getAllPermissionCategories(function(err,data){
			cb(err,data);
		});
	});
}

function getAllOffices(req, res) {
	getAPIData(req, res, function(cb) {
		companyAPI.getAllOffices(function(err, data) {
			cb(err, data);
		});
	});
}

function getConcernedGroupNames(req,res){
	getAPIData(req,res,function(cb){
		permissionAPI.getConcernedGroupNames(JSON.parse(req.query.info),function(err,data){
			cb(err,data);
		});
	});
}

function getAllDepts(req, res) {
	getAPIData(req, res, function(cb) {
		companyAPI.getAllDepartments(function(err, data) {
			cb(err, data);
		});
	});
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
			res.writeHead(200);
			res.write(err ? err.toString() : '');
			res.end();
		});
}