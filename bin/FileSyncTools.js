#!/usr/bin/env node
/**
 * FileSyncTool.js
 * Author: Christopher A Wininger
 * Date: 8/30/2013
 *
 * A command line interface to the FileSyncTools API
 *
*/
var fs = require('fs'),
	_ = require('underscore'),
	nconf = require('nconf'),
	FileSyncTools = require(__dirname + '/../lib/FileSyncTools.js'),
	clc = require("cli-color");

var usageStatement = 'invalid arguments\n usage: FileSyncTool command [--flags] [args]';

var fileSyncTools = new FileSyncTools();
// --- Flag Constants ---
var FLAGS = {
	followSymbolicLinks: 'followSymbolicLinks'
};
// --- Command Definitions for console ---
var commands = {
	listFilesRecursive: function (path) {
		if (!path) return _errorAndExit(usageStatement);
		fileSyncTools.listFilesRecursive(path, flags[FLAGS.followSymbolicLinks], function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listMissingFiles: function (path1, path2) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.listMissingFiles(path1, path2, flags[FLAGS.followSymbolicLinks], function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listDuplicateFiles: function (path1, path2) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.listDuplicateFiles(path1, path2, flags[FLAGS.followSymbolicLinks], function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	}
};

// --- Execute Requested Command ----
var commandArray = [];
var flags = {};
_.each(process.argv, function (param, key) {
	// skip first two params (node and js file)
	if (key < 2) return;
	if (param.indexOf('-') !== 0) {
		// command
		commandArray.push(param);
	} else {
		// flag
		switch (param) {
			case '--followSymbolicLinks':
			case '-fl':
				flags[FLAGS.followSymbolicLinks] = true;
				break;
		}
	}
});
if (commandArray.length < 1) return _errorAndExit(usageStatement);
var command = commandArray.shift();
if (!commands[command]) return _errorAndExit('unrecognized command');
return commands[command].apply(this, commandArray)

// ---- Helper Functions ----
function _errorAndExit(errMsg) {
	console.error(clc.red(errMsg));
	return process.exit(1);
}

function _printFiles(files) {
	_.each(files, function (file) {
		console.log(clc.green.bold(file.fileName) + clc.blue(' (' + file.fullPath + ')'));
	});
}