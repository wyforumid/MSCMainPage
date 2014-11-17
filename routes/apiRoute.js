var express = require('express');
var async = require('async');
var router = express.Router();
var companyAPI = require('../API/companyInfoAPI');
var userAPI = require('../API/userAPI');
var permissionAPI = require('../API/permissionAPI');

router.route('/')
	.get(function(req, res, next) {
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

router.route('/user/:actionName')
	.put(function(req, res, next) {
		resetPassword(req, res);
	})
	.post(function(req, res, next) {
		switch(req.params.actionName.toUpperCase()){
			case 'LOGIN':
			Login(req,res);
			break;
			case 'REGIST':
			registUser(req, res);
			break;
		}
		
	})
	.get(function(req,res,next){
		if(req.params){

		}else{

		}
	});

module.exports = router;



function Login(req,res){
	async.waterfall([
		function(cb){
			userAPI.login(req.body.userName,req.body.password,req.ip,cb);
		}
	],function(err,data){

	});
}

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


function resetPassword(req, res) {

	if (req.body.updateMode === "password") {
		getAPIData(req, res, function(cb) {
			userAPI.resetPassword(req.body.user.email, function(err, data) {
				try {
					cb(err, data);
				} catch (e) {
					cb(e, data);
				}
			});
		});
	} else if (req.body.updateMode === "all") {
		//update user of all field 
	}

}


router.route('/permission/:actionName')
	.get(function(req, res, next) {
		switch (req.params.actionName.toUpperCase()) {
			case 'CONCERNEDGROUPNAMES':
				getConcernedGroupNames(req, res);
				break;
			case 'ALLPERMISSIONS':
				getAllPermissions(req, res);
				break;
			case 'ALLPERMISSIONCATEGORIES':
				getAllPermissionCategories(req, res);
				break;
			case 'OWNPERMISSIONS':
				getOwnPermission(req,res);
				break;
			default:
				res.response.writeHead(404);
				res.write();
				res.end();
		}
	});

function getOwnPermission(req,res){
	getAPIData(req,res,function(cb){
		permissionAPI.getOwnPermission(req.query.id,function(err,data){
			cb(err,data);
		})
	});
}

function getAllPermissions(req, res) {
	getAPIData(req, res, function(cb) {
		permissionAPI.getAllPermissions(function(err, data) {
			cb(err, data);
		});
	});
}

function getAllPermissionCategories(req, res) {
	getAPIData(req, res, function(cb) {
		permissionAPI.getAllPermissionCategories(function(err, data) {
			cb(err, data);
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

function getConcernedGroupNames(req, res) {
	getAPIData(req, res, function(cb) {
		permissionAPI.getConcernedGroupNames(JSON.parse(req.query.info), function(err, data) {
			cb(err, data);
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
			res.writeHead(404);
			res.write(err ? err.toString() : '');
			res.end();
		});
}