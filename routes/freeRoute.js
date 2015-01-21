var express = require('express');
var userCtrl = require('../controllers/userController');
var companyCtrl = require('../controllers/companyController');
// var func = require('../controllers/func');
var router = express.Router();

var user = new userCtrl();
var company = new companyCtrl();


router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		res.render('main.html');
	} else {
		res.render('index.html');
	}

});

router.get('/free', function(req, res) {
	res.render('freeIndex.html');
});




router.route('/user/:actionName')
	.put(function(req, res, next) {
	})
	.post(function(req, res, next) {
		switch(req.params.actionName.toUpperCase()){
			case 'RESETPWD':
			user.POST.RESETPWD(req, res);
				break;
			case 'REGIST':
			user.POST.REGIST(req, res);
				break;
		}

	})
	.get(function(req, res, next) {
	});

router.route('/company/:actionName')
	.get(function(req, res, next) {

		switch(req.params.actionName.toUpperCase()) {
			case 'ALLOFFICES':
				company.GET.ALLOFFICES(req, res);
				break;
			case 'ALLDEPTS':
				company.GET.ALLDEPTS(req, res);
				break;
		}

	});


module.exports = router;