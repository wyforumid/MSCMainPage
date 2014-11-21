var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	if(req.isAuthenticated()){
		res.render('main.html');
	}else{
		res.render('index.html');	
	}
	
});

// router.get('', function(req, res) {
// 	res.render('main.html');
// });

module.exports = router;