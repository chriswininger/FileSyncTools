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
	clc = require("cli-color"),
    util = require('util');

var TITLE = 'FileSyncTools',
    invalidArgs = 'invalid arguments\n' + _getUsageStatement();

var fileSyncTools = new FileSyncTools();
// --- Flag Constants ---
var FLAGS = {
    byHash: 'byHash',
	followSymbolicLinks: 'followSymbolic',
    help: 'help',
    includeHash: 'includeHash',
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
		if (!(path1 || path2)) return _errorAndExit(invalidArgs);
		fileSyncTools.copyMissing(path1, path2, options, function (err, numFilesCoppied) {
			if (err) return _errorAndExit('error: ' + err);
			console.info(clc.green.bold('complete ' + numFilesCoppied + ' files have been copied'));
		});
	},
	listFilesRecursive: function (path, options) {
		if (!path) return _errorAndExit(invalidArgs);
		fileSyncTools.listFilesRecursive(path, options, function (err, files) {
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listMissingFiles: function (path1, path2, options) {
		if (!(path1 || path2)) return _errorAndExit(invalidArgs);
		fileSyncTools.listMissingFiles(path1, path2, options, function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
	listDuplicateFiles: function (path1, path2, options) {
		if (!(path1 && path2)) return _errorAndExit(invalidArgs);
        if (!_.isObject(options)) {
            // command used with one path
            options = path2;
            path2 = path1;
        }
        fileSyncTools.listDuplicateFiles(path1, path2, options, function (err, files){
			if (err) return _errorAndExit('error: ' + err);
			_printFiles(files);
		});
	},
    listDuplicateFilesByHash: function (path1, path2, options) {
        if (!(path1 && path2)) return _errorAndExit(invalidArgs);
        if (!_.isObject(options)) {
            // command used with one path
            options = path2;
            path2 = path1;
        }
        options.byHash = true;
        fileSyncTools.listDuplicateFiles(path1, path2, options, function (err, files){
            if (err) return _errorAndExit('error: ' + err);
            _printFiles(files);
        });
    },
    help: function () {
        var strHelp = '\n' + _getUsageStatement() + '\n\nCommands:\n';
        strHelp += _getCommandsList();
        console.info(strHelp);
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
            case '--includeHash':
            case '-ih':
                flags[FLAGS.includeHash] = true;
                break;
            case '-h':
            case '--help':
                flags[FLAGS.help] = true;
                // just treat this as a command
                commandArray.push('help');
                break;
		}
	}
});
if (commandArray.length < 1) return _errorAndExit(usageStatement);
var command = commandArray.shift();
if (!commands[command]) return _errorAndExit('unrecognized command');

// append options
commandArray.push(flags);

fileSyncTools.setVerbose(!!flags[FLAGS.verbose]);
// perform requested command
return commands[command].apply(this, commandArray)

// ---- Helper Functions ----
function _getUsageStatement () {
    var strFlags = '';
    _.each(FLAGS, function (v, flag) {
        strFlags += util.format('[--%s]', flag);
    });

    return util.format('usage: %s %s <command> [<args>]', TITLE, strFlags);
}

function _getCommandsList () {
    var strCommands = '';
    _.each(commands, function (f, command) {
        strCommands += '   ' + command + '\n';
    });

    return strCommands;
}

function _errorAndExit(errMsg) {
	console.error(clc.red(errMsg));
	return process.exit(1);
}

function _printFiles(files, options) {
    var filteredFiles = {};
    var combineKey = 'fileName';


    _.each(files, function (f) {
        if (!filteredFiles[f[combineKey]]) filteredFiles[f[combineKey]] = '';
        filteredFiles[f[combineKey]] += '\n   ' + f.fullPath + (f.warning ? clc.red('-- hash: ' + f.warning + '[' + f.fileHash + ']') : '');
    });


	_.each(filteredFiles, function (filesString, key) {
		console.log(clc.bold(key) +  filesString);
	});
}