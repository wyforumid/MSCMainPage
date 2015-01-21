var express = require('express');
var user = require('../controllers/userController');
var company = require('../controllers/companyController');
// var func = require('../controllers/func');
var router = express.Router();

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
				user.resetPassword(req, res);
				break;
			case 'REGIST':
				user.registerUser(req, res);
				break;
		}

	})
	.get(function(req, res, next) {
	});

router.route('/company/:actionName')
	.get(function(req, res, next) {

		switch(req.params.actionName.toUpperCase()) {
			case 'ALLOFFICES':
				company.allOffices(req, res);
				break;
			case 'ALLDEPTS':
				company.allDepts(req, res);
				break;
		}

	});


module.exports = router;