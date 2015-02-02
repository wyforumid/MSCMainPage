var downloadAPI = require('../API/downloadAPI');
var _ = require('underscore');

var soRequestAttachFolder = 'R:\\IT\\DevTeam\\EfficientStaff2015\\SOSupportingFile';

module.exports = function() {
	this.controllerName = 'download';

	this.GET = {
		SO: function(req, res, next) {
			var id = parseInt(req.query.id);
			if (_.isNumber(id)) {
				downloadAPI.getSOSupportingFileAddress(id, function(err, data) {
					if (err) {
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.write(JSON.stringify(err));
						res.end();
					} else {
						if (data && data.length > 0) {
							var filePath = soRequestAttachFolder + data[0].SaveFilePath.toString();
							var extension = filePath.substr(filePath.lastIndexOf('.'));
							res.download(filePath, data[0].Notes + extension);
						} else {
							res.writeHead(200, {
								"Content-Type": "application/json"
							});
							res.write(JSON.stringify('No such file.'));
							res.end();
						}

					}
				})
			}
		}
	}
}