var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res) {
// 	res.render('index.html');
// });


router.get('/', function(req, res) {
	res.render('main.html');
});

router.get('/Logout',function(req,res){
	req.logout();
	res.redirect('/');
});



module.exports = router;