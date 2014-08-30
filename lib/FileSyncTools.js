var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf');

nconf.argv();

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
   	listFilesRecursive: function (path, complete, rtnFiles) {
		var self = this;
		rtnFiles = rtnFiles || {};
		// TODO (CAW) FETCH HERE AND THREAD ALONG
		fs.readdir(path, function (err, files){
			if (err) return complete('could not read directory ' + path);

			var _doneProcessing = _.after(files.length, function () {
				complete(null, rtnFiles);
			});
			if (files.length === 0) return complete(null, []);
			_.each(files, function (file) {
				fs.stat(path + '/' + file, function (err, stat) {
					if (err) return complete('could not process ' + file + ': ' + err);
					if (stat.isDirectory()) {
						self.listFilesRecursive(path + '/' + file, function (err, files) {
							if (err) return complete(err);
							_.each(files, function (file,key) {
								rtnFiles[key] = file;
							});
							_doneProcessing();
						}, rtnFiles);
					} else {
						// TODO (CAW): make array for duplicates
						rtnFiles[path + '/' + file] = { fileName: file };
						_doneProcessing();
					}
				});
			});
		});
	}
});

function _errorAndExit(errMsg) {
	console.error(errMsg);
	return process.exit(1);
}