var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf');

nconf.argv();

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
   execute: function () {
		var commandArray = [];
	   _.each(process.argv, function (param, key) {
		   	// skip first two params (node and js file)
		  	if (key < 2) return;
			if (param.indexOf('-') !== 0) commandArray.push(param)
	   });

	   if (commandArray.length !== 3) return _errorAndExit('invalid arguments\n usage: FileSyncTool command path1 path2');

	   var command = commandArray.shift();
	   if (!this[command]) return _errorAndExit('unrecognized command');
	   // execute the command
	   return this[command].apply(this, commandArray)
   },
	listMissingFiles: function (syncPath1, syncPath2, complete) {
		var self = this,
			files1 = {},
			files2 = {};

		var _processFiles = function (files, path, _complete) {
			var rtnFiles = {};

			// TODO (CAW) FETCH HERE AND THREAD ALONG
			if (!files) {

			};

			var _doneProcessing = _.after(files.length, function () {
				_complete(null, rtnFiles);
			});
			if (files.length === 0) return _complete(null, []);
			_.each(files, function (file) {
				console.info('processing: ' + file);
				fs.stat(file, function (err, stat) {
					if (err) return _errorAndExit('could not process ' + file + ': ' + err);
					if (stat.isDirectory()) {
						self.listMissingFiles(file, function (err, files) {
							_.each(files, function (file) {
								rtnFiles[file] = file;
							});
							_doneProcessing();
						});
					} else {
						// TODO (CAW): make array for duplicates
						rtnFiles[file] = file;
						_doneProcessing();
					}
				});
			});
		};

		var _processedBothSets = _.after(2, function  () {
			// begin looking for differences
			console.log('files1: ' + JSON.stringify(files1));
			console.log('files2: ' + JSON.stringify(files2));

		});

		fs.readdir(syncPath1, function (err, files){
			if (err) return _errorAndExit('could not read directory ' + syncPath1);
			files1 = files;
			_processFiles(files, function (err, files) {
				_processedBothSets();
				files1 = files;
			});
		});
		fs.readdir(syncPath2, function (err, files){
			if (err) return _errorAndExit('could not read directory ' + syncPath2);

			_processFiles(files, function (err, files) {
				_processedBothSets();
				files2 = files;
			});
		});
	}
});

function _errorAndExit(errMsg) {
	console.error(errMsg);
	return process.exit(1);
}