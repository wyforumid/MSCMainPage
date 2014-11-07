var express = require('express');
var async = require('async');
var router = express.Router();
var companyAPI = require('../API/companyInfoAPI');

router.route('/API/company/:actionName')
.get(function(req,res,next){
	switch(req.params.actionName.toUpperCase()){
		case 'ALLOFFICES':
		getAllOffices(req,res);
		break;
		default:
		res.response.writeHead(404);
		res.write();
		res.end();
	}
});


function getAllOffices(req,res){
	getAPIData(req,res,function(cb){
		companyAPI.getAllOffices(function(err,data){
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

