var Router = require('../router/lib/simpleRouter');
var userCtrl = require('../controllers/userController');
var companyCtrl = require('../controllers/companyController');
var permissionCtrl = require('../controllers/permissionController');
var soCtrl = require('../controllers/soController');
var downloadCtrl = require('../controllers/downloadController');


module.exports = function(req, res, next) {
	var router = new Router({
		pathPattern: null,
		controllers: [new userCtrl(),
			new companyCtrl(),
			new permissionCtrl(),
			new soCtrl(),
			new downloadCtrl()
		]
	});

	router.execReq(req, res);
}