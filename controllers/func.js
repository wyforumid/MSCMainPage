var async = require('async');

exports.getData = function(req, res, getFunc) {
	async.waterfall([
			function(cb) {
				getFunc(cb);
			},
			function(data, cb) {
				res.writeHead(200, {
					"Content-Type": "application/json"
				});
				res.write(JSON.stringify(data));
				res.end();
			}
		],
		function(err, result) {
			res.writeHead(404);
			res.write(err ? err.toString() : '');
			res.end();
		})
}