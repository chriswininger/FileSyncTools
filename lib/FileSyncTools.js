var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf'),
	debug = require('debug')('FileSyncTools');

nconf.argv();

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
   	listFilesRecursive: function (path, followSymbolic, complete, rtnFiles) {
		var self = this;
		rtnFiles = rtnFiles || [];
		fs.readdir(path, function (err, files){
			if (err) return complete('could not read directory ' + path);

			var _doneProcessing = _.after(files.length, function () {
				complete(null, rtnFiles);
			});
			if (files.length === 0) return complete(null, []);
			_.each(files, function (file) {
				fs.lstat(path + '/' + file, function (err, stat) {
					if (err) return complete('could not process ' + file + ': ' + err);
					if (!followSymbolic && stat.isSymbolicLink()) {
						debug('skipping symbolic link ' + path + '/' + file);
						return _doneProcessing();
					}
					if (stat.isDirectory()) {
						self.listFilesRecursive(path + '/' + file, followSymbolic, function (err, files) {
							if (err) return complete(err);
							_doneProcessing();
						}, rtnFiles);
					} else {
						rtnFiles.push({ fileName: file, fullPath: path + '/' + file});
						_doneProcessing();
					}
				});
			});
		});
	},
	listMissingFiles: function (path1, path2, followSymbolicLinks, complete){
		_compareFiles(path1, path2, true, this, followSymbolicLinks, complete);
	},
	listDuplicateFiles: function (path1, path2, followSymbolicLinks, complete) {
		debug('searching for duplicates');
		_compareFiles(path1, path2, false, this, followSymbolicLinks, complete);
	}
});

// --- Private Helper functions ---
function _compareFiles (path1, path2, missing, fileSync, followSymbolicLinks, complete) {
	complete = complete || function () {};
	if (!(path1 || path2)) return complete('missing parameters');
	var files1, files2;

	var _processedList = _.after(2, function () {
		complete(null, _findDiffOrOverlap(files1, files2, missing));
	});
	fileSync.listFilesRecursive(path1, followSymbolicLinks, function (err, files) {
		if (err) return complete(err);
		files1 = files;
		_processedList();
	});
	fileSync.listFilesRecursive(path2, followSymbolicLinks, function (err, files) {
		if (err) return complete(err);
		files2 = files;
		_processedList();
	});
}
/**
 * Will either find the difference between two sets of files
 * or the overlap between the two files depending on the flag
 * @param files1
 * @param files2
 * @param missing
 * @returns {Array}
 * @private
 */
function _findDiffOrOverlap(files1, files2, missing) {
	var diff = [];
	_.each(files1, function (file) {
		var copy = _.find(files2, function (f) {
			return file.fileName === f.fileName;
		});

		debug('missing: ' + missing + '; copy found: ' + !! copy);
		if (!copy && missing) diff.push(file);
		else if (copy && !missing) diff.push(file);
	});

	return diff;
}