var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index.html');
});

// router.get('', function(req, res) {
// 	res.render('main.html');
// });

module.exports = router;