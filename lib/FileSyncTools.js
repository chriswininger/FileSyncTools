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

		var _processFiles = function (path, complete, rtnFiles) {
			rtnFiles = rtnFiles || {};
			// TODO (CAW) FETCH HERE AND THREAD ALONG
			console.log('!!! reading path: ' + path + ' isFunc ' + _.isFunction(complete));
			fs.readdir(path, function (err, files){
				if (err) return _errorAndExit('could not read directory ' + syncPath1);

				var _doneProcessing = _.after(files.length, function () {
					_.each(rtnFiles, function (val,key){
						console.log('!!! end: ' + key + ':' + val);
					});
					complete(null, rtnFiles);
				});
				if (files.length === 0) return complete(null, []);
				_.each(files, function (file) {
					console.info('processing: ' + file);
					fs.stat(path + '/' + file, function (err, stat) {
						if (err) return _errorAndExit('could not process ' + file + ': ' + err);
						if (stat.isDirectory()) {
							console.log('!!! path ' + path + '/' + file);
							_processFiles(path + '/' + file, function (err, files) {
								_.each(files, function (file,key) {
									console.log('!!! each ' + key);
									rtnFiles[key] = file;
								});
								_doneProcessing();
							}, rtnFiles);
						} else {
							console.log('!!! seting file: ' + file);
							// TODO (CAW): make array for duplicates
							rtnFiles[path + '/' + file] = { fileName: file };
							_doneProcessing();
						}
					});
				});
			});



		};

		var _processedBothSets = _.after(2, function  () {
			// begin looking for differences
			_.each(files1, function (key, value) {
				console.log('files1: ' + key + ':' + value);
			});

			_.each(files2, function (key, value) {
				console.log('files2: ' + key + ':' + value);
			});
		});

		_processFiles(syncPath1, function (err, files) {
			_processedBothSets();
			_.each(files, function (key, value) {
				console.log('files?: ' + key + ':' + value);
			});
		});
		_processFiles(syncPath2, function (err, files) {
			_processedBothSets();
			files2 = files;
		});
}
});

function _errorAndExit(errMsg) {
	console.error(errMsg);
	return process.exit(1);
}