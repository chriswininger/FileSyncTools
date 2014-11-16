#!/usr/bin/env node
// TODO (CAW): Add CopyMissing and add flag to indicate how much of the directory will be coppies (i.e just copy missing file to root of new folder or take folder up on level etc..)
/**
 * FileSyncTool.js
 * Author: Christopher A Wininger
 * Date: 8/30/2013
 *
 * A command line interface to the FileSyncTools API,
 *   this is where the arguments are parsed, the execution of commands
 *   is handled in the CommandExecutor.js file
 *
*/
var _ = require('underscore'),
    CommandExecutor = require(__dirname + '/../lib/CommandExecutor.js'),
    FSUtils = require(__dirname + '/../lib/FileSyncUtils');

// --- Execute Requested Command ----
// parse request
var commandArray = [],
    flags = {};

_.each(process.argv, function (param, key) {
	// skip first two params (node and js file)
	if (key < 2) return;
	if (param.indexOf('-') !== 0) {
		// command
		commandArray.push(param);
	} else {
		// flag
		switch (param) {
            case '--byHash':
            case '--bh':
                flags[CommandExecutor.flags.byHash] = true;
                break;
			case '--followSymbolicLinks':
			case '-fl':
				flags[CommandExecutor.flags.followSymbolicLinks] = true;
				break;
			case '--verbose':
            case '--v':
				flags[CommandExecutor.flags.verbose] = true;
				break;
            case '--includeHash':
            case '-ih':
                flags[CommandExecutor.flags.includeHash] = true;
                break;
            case '--includeOriginal':
            case '-io':
                flags[CommandExecutor.flags.includeOriginal] = true;
                break;
            case '-h':
            case '--help':
                flags[CommandExecutor.flags.help] = true;
                // just treat this as a command
                commandArray.push('help');
                break;
		}
	}
});
// check that a command was supplied
if (commandArray.length < 1) return FSUtils.errorAndExit(CommandExecutor.getInvalidArgumentsResponse());
// pull off command and append flags object
var command = commandArray.shift();
commandArray.push(flags);
// perform requested command
return CommandExecutor.executeCommand(command, commandArray, !!flags[CommandExecutor.flags.verbose]);
