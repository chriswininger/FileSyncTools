#!/usr/bin/env node
// TODO (CAW): Add CopyMissing and add flag to indicate how much of the directory will be coppies (i.e just copy missing file to root of new folder or take folder up on level etc..)
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
	FileSyncTools = require(__dirname + '/../lib/FileSyncTools.js'),
	clc = require("cli-color");

var usageStatement = 'invalid arguments\n usage: FileSyncTool command [--flags] [args]';

var fileSyncTools = new FileSyncTools();
// --- Flag Constants ---
var FLAGS = {
	followSymbolicLinks: 'followSymbolicLinks',
	verbose: 'verbose'
};
// --- Command Definitions for console ---
var commands = {
	testProgress: function () {
		var bar = new ProgressBar('   copying [:bar]  :percent', { width: 10, total: 10 });
		var timer = setInterval(function () {
			bar.tick();
			if (bar.complete) {
				console.log('\ncomplete\n');
				clearInterval(timer);
			}
		}, 100);
	},
	copyMissingFiles: function (path1, path2, options) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.copyMissing(path1, path2, options, function (err, numFilesCoppied) {
			if (err) return _errorAndExit('error: ' + err);
			console.info(clc.green.bold('complete ' + numFilesCoppied + ' files have been copied'));
		});
	},
	listFilesRecursive: function (path, options) {
		if (!path) return _errorAndExit(usageStatement);
		fileSyncTools.listFilesRecursive(path, options, function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listMissingFiles: function (path1, path2, options) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.listMissingFiles(path1, path2, options, function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listDuplicateFiles: function (path1, path2, options) {
		if (!(path1 || path2)) return _errorAndExit(usageStatement);
		fileSyncTools.listDuplicateFiles(path1, path2, options, function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	}
};

// --- Execute Requested Command ----
// parse request
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
			case '--verbose':
				flags[FLAGS.verbose] = true;
				break;
		}
	}
});
if (commandArray.length < 1) return _errorAndExit(usageStatement);
var command = commandArray.shift();
if (!commands[command]) return _errorAndExit('unrecognized command');
// append options
commandArray.push({
	followSymbolic: flags[FLAGS.followSymbolicLinks]
});
fileSyncTools.setVerbose(!!flags[FLAGS.verbose]);
// perform requested command
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