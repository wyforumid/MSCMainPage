//options : {'pathPattern':'','controllers':[]} --controllers
module.exports = function(options){
	if(!options){
		throw new Error();
	}
	var pathPattern = '',
		controllers = {}
		seperator= '';

	path = options.pathPattern ? options.pathPattern : '/{controller}/{action}';
	controllers = optins.controllers && options.controllers.length > 0 ? initialContoller(options.controllers) : throw new Error();


	analyseSeperator();



	function analyseSeperator(path){
		var tempPath = removeBackslash(path);

		seperator = tempPath.replace(/\{controller\}/i,'').replace(/\{action\}/i,'');

	}

	function removeBackslash(path){
		var tempPath = path;
		if(tempPath.charAt(0) == '/'){
			tempPath = tempPath.substring(1);
		}

		if(tempPath.charAt(tempPath.length-1) == '/'){
			tempPath = tempPath.substring(0,tempPath.length-2);
		}
	}

	function initialController(controllerArray){
		if(!controllerArray || controllerArray.length == 0){
			return;
		}

		for(var i  = 0, length = controllerArray.length; i < length; i++){
			var type = controllerArray[i].hasOwnProperty('controllerName') ?
			 	controllerArray[i].controllerName : '';
			if(type == ''){
				throw new Error();
			}else if( controllers.hasOwnProperty(type)){
				throw new Error();
			}else{
				(function(name, index){
					controllers[name] = controllerArray[i]; 
				})(type, i);
			}
		}	
	}

	this.execReq = function(req,res){
		var method = req.method.toUpperCase();
		var currentPath = req.path;
		currentPath = removeBackslash(currentPath);
		var valuePair = currentPath.split(seperator);
		if(valuePair.length != 2){
			throw new Error();
		}else{
			var controllerName = valuePair[0]
				actionName = valuePair[1];
			if(controllers[controllerName][method][actionName]){
				controllers[controllerName][method][actionName](req,res);
			}
		}
	}

}