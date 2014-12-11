var func = require('./func');
var soAPI = require('../API/soAPI');

module.exports = function(){
	this.controllerName = 'so';

	this.GET = {
		GETMAINSOREQUEST : function(req,res){
			func.getData(req,res,function(cb){
				var userInfo = req.getUserInfo();
				if(userInfo){
					soAPI.GetMainDisplaySORequest(JSON.parse(userInfo),function(err,data){
						try{
							cb(err,data);
						}catch(ex){
							cb(ex,data);
						}
					});
				}else{
					cb('Please login first',null);
				}
				
			});
		}
	}

	this.POST = {};

	this.PUT = {};

	this.DELETE = {};
}