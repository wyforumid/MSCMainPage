var async = require('async');
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');

var soRequestAttachFolder = 'D:\\publish\\SORequest';

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

exports.jsonResponse = function(req, res, getResponseDataFunc) {
	async.waterfall([
			function(cb) {
				getResponseDataFunc(cb);
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

exports.multiparty = function() {
	var processor = new multiparty.Form({
		uploadDir: '../tempFiles'
	});
	return processor;
}

// exports.moveFileFromTempFilesFolder = function(req, res, sourcePath, fileName) {
// 	fs.rename(source,
// 		soRequestAttachFolder + getMiddleFolderPath() + renameFileName(fileName),
// 		function(err) {
// 			if (err) jsonResponse(req, res, function)
// 		});

// 	jsonResponse.(req, res, function(callback){
// 		fs.rename(sourcePath,
// 			soRequestAttachFolder + getMiddleFolderPath() + renameFileName(fileName),
// 			function(err){
// 				if(err) callback(err, null);

// 			})
// 	})
// }
exports.moveFileToTargetFolder = function(requestInfo, cb) {
	createEssentialFolder(function(err) {
		if (err) cb(err, null);
		requestInfo.filePath = soRequestAttachFolder + getMiddleFolderPath() + renameFileName(requestInfo.fileName);
		fs.rename(requestInfo.fileTempPath, requestInfo.filePath, function(err) {
			if (err) cb(err, null);
			requestInfo.filePath = requestInfo.filePath.replace(soRequestAttachFolder, '');
			cb(null, requestInfo);
		});
	});

}

exports.generalRelativeFilePath = function(fileName) {
	// createEssentialFolder(function(err) {
	// 	if (err) {
	// 		throw err;
	// 	} else {
	return getMiddleFolderPath() + renameFileName(fileName);
	// 	}
	// })

}

function createEssentialFolder(callback) {
	var folderPath = soRequestAttachFolder + getMiddleFolderPath();
	mkdirp(folderPath, function(err) {
		if (err) callback(err);
		callback(null);
	})
}

function getMiddleFolderPath() {
	var date = new Date();
	return '\\' + date.getFullYear() + '\\' + (date.getMonth() + 1).toString() + '\\' + date.getDate().toString() + '\\';
}

function renameFileName(originalName) {
	var dotIndex = originalName.indexOf('.'),
		extension;
	if (dotIndex < originalName.length - 1) {
		extension = originalName.substr(dotIndex);

	} else {
		extension = '';
	}
	var md5 = crypto.createHash('md5');
	return md5.update(originalName + Date.now().toString()).digest('hex') + extension;
}