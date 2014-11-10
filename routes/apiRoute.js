var express = require('express');
var async = require('async');
var router = express.Router();
var companyAPI = require('../API/companyInfoAPI');
var userAPI = require('../API/userAPI');

// router.route('/')
// .all(function(req,res,next){
// 	console.log('in');
// 	next();
// })
router.route('/company/:actionName')
// router.route('/API/company/ALLOFFICES')
//router.route('/API/company/')
.all(function(req,res,next){
	next();
})
.get(function(req,res,next){
	switch(req.params.actionName.toUpperCase()){
		case 'ALLOFFICES':
		getAllOffices(req,res);
		break;
		case 'ALLDEPTS' :
		getAllDepts(req,res);
		break;
		default:
		res.response.writeHead(404);
		res.write();
		res.end();
	}
});

router.route('/user')
.get(function(req,res,next){

})
.post(function(req,res,next){
	registUser(req,res);
});






module.exports = router;







function registUser(req,res){
	getAPIData(req,res,function(cb){
		userAPI.registUser(
			req.body.loginName,
			req.body.fullName,
			req.body.email,
			req.body.office.id,
			req.body.dept.id,
			function(err,data){
				try{
					cb(err,data);	
				}
				catch(e){
					cb(e,data);
				}
				
			}
		);
	})
}

function getAllOffices(req,res){
	getAPIData(req,res,function(cb){
		companyAPI.getAllOffices(function(err,data){
			cb(err,data);
		});
	});
}

function getAllDepts(req,res){
	getAPIData(req,res,function(cb){
		companyAPI.getAllDepartments(function(err,data){
			cb(err,data);
		});
	});
}

function getAPIData(req,res,getFunc){
	async.waterfall([
		function(cb){
			getFunc(cb);
		},
		function(data,cb){
			res.writeHead(200,{"Content-Type":"application/json"});
			res.write(JSON.stringify(data));
			res.end();
		}],
		function(err,result){
			res.writeHead(200);
			res.write(err?err.toString():'');
			res.end();
		});
}

