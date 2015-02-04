var foundationAPI = require('../API/foundationAPI');
var func = require('./func');


module.exports = function() {
	this.controllerName = 'foundation';

	this.GET = {
		AUTOCOMPLETESERVICE: function(req, res) {
			func.getData(req, res, function(cb) {
				foundationAPI.autocompleteService(req.query.key, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
					}
				});
			});
		},
		AUTOCOMPLETEGROUP:function(req, res) {
			func.getData(req, res, function(cb) {
				foundationAPI.autocompleteGroup(req.query.key, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
					}
				});
			});
		},
		AUTOCOMPLETEUSER:function(req, res) {
			func.getData(req, res, function(cb) {
				foundationAPI.autocompleteUser(req.query.key, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
					}
				});
			});
		},
		AUTOCOMPLETEPOR:function(req, res) {
			func.getData(req, res, function(cb) {
				foundationAPI.autocompletePOR(req.query.key, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
					}
				});
			});
		},
		AUTOCOMPLETEPOL:function(req, res) {
			func.getData(req, res, function(cb) {
				foundationAPI.autocompletePOL(req.query.key, function(err, data) {
					try {
						cb(err, data);
					} catch (ex) {
						cb(ex, data);
					}
				});
			});
		},
	}

	this.POST = {}

	this.PUT = {}

	this.DELETE = {}

}