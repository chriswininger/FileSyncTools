#!/usr/bin/env node
var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf'),
	FileSyncTools = require(__dirname + '/../lib/FileSyncTools.js');

var usageStatement = 'invalid arguments\n usage: FileSyncTool command [--flags] [args]';

var fileSyncTools = new FileSyncTools();
// --- Command Definitions for console ---
var commands = {
	listFilesRecursive: function (path) {
		if (!path) return _errorAndExit(usageStatement);
		fileSyncTools.listFilesRecursive(path, function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_.each(files, function (file) {
				console.log(file.fullPath + ':' + file.fileName);
			});
		});
	},
	listMissingFiles: function (path1, path2) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.listFilesRecursive(path1, function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_.each(files, function (file, fullPath) {
				console.log('files1: ' + fullPath + ':' + file.fileName);
			});
		});
		fileSyncTools.listFilesRecursive(path2, function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_.each(files, function (file, fullPath) {
				console.log('files2: ' + fullPath + ':' + file.fileName);
			});
		});
	}
};

// --- Execute Requested Command ----
var commandArray = [];
_.each(process.argv, function (param, key) {
	// skip first two params (node and js file)
	if (key < 2) return;
	if (param.indexOf('-') !== 0) commandArray.push(param)
});
if (commandArray.length < 1) return _errorAndExit(usageStatement);
var command = commandArray.shift();
if (!commands[command]) return _errorAndExit('unrecognized command');
return commands[command].apply(this, commandArray)

// ---- Helper Functions ----
function _errorAndExit(errMsg) {
	console.error(errMsg);
	return process.exit(1);
}
