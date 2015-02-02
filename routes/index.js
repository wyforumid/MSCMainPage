var express = require('express');
var router = express.Router();


router.get('/main', function(req, res) {
	res.render('main.html');
});

router.get('/main/Logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/user', function(req, res) {
	res.render('user.html');
})
router.get('/SO', function(req, res) {
	res.render('soMain.html');
})


module.exports = router;