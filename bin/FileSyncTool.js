var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf');

nconf.argv();

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
   execute: function () {
		var commandArray = [];
	   _.each(process.argv, function (param) {
			if (param.indexOf('-') !== 0) commandArray.push(param)
	   });

	   if (commandArray.length !== 3) return _errorAndExit('invalid arguments\n usage: FileSyncTool command path1 path2');

	   var command = commandArray.shift();
	   if (!this[command]) return _errorAndExit('unrecognized command');

	   // execute the command
	   return this[command].call(this, commandArray)
   },
	listMissingFiles: function (syncPath1, syncPath2, complete) {
		var files1 = [];
		/*var _processFiles = _.after(2, function (){
			_.each(files1, function (file) {

			});
			_.each(files2, function (file) {

			});
		});*/
		var _processFiles = function (files) {
			_.each(files, function (file) {
				console.info('processing: ' + file);
				fs.stat(file, function (err, stat) {

				});
			});
		};

		fs.readdir(syncPath1, function (err, files){
			if (err) return _errorAndExit('could not read directory ' + syncPath1);
			files1 = files;
			_processFiles(files);
		});
		fs.readdir(syncPath2, function (err, files){
			if (err) return _errorAndExit('could not read directory ' + syncPath2);

			_processFiles(files);
		});
	}
});

function _errorAndExit(errMsg) {
	console.error(errMsg);
	return process.exit(1);
}