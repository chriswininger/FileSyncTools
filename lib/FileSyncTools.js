var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf');

nconf.argv();

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
   	listFilesRecursive: function (path, complete, rtnFiles) {
		var self = this;
		rtnFiles = rtnFiles || [];
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
							_doneProcessing();
						}, rtnFiles);
					} else {
						// TODO (CAW): make array for duplicates
						rtnFiles.push({ fileName: file, fullPath: path + '/' + file});
						_doneProcessing();
					}
				});
			});
		});
	},
	listMissingFiles: function (path1, path2, complete) {
		complete = complete || function () {};
		if (!(path1 || path2)) return complete('missing parameters');
		var files1, files2;

		var _processedList = _.after(2, function () {
			_findMissing(files1, files2, complete);
		});
		this.listFilesRecursive(path1, function (err, files) {
			if (err) return complete(err);
			files1 = files;
			_processedList();
		});
		this.listFilesRecursive(path2, function (err, files) {
			if (err) return complete(err);
			files2 = files;
			_processedList();
		});
	}
});

// --- Private Helper functions ---
function _findMissing(files1, files2, complete) {

}