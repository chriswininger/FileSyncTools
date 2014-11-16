/**
 * CommandExecutor.js
 * Author: Christopher A Wininger
 * Date: 11/16/2014
 *
 * Defines commands available to the console application
 *   and provides the ability to carry out those commands
 *   rendering string responses to the console
 *
 */
var FileSyncTools = require(__dirname + '/FileSyncTools.js'),
    FSUtils = require(__dirname + '/FileSyncUtils.js'),
    util = require('util'),
    clc = require('cli-color'),
    _ = require('underscore'),
    debug = require('debug')('FileSyncTools:CommandExecutor');

var TITLE = 'FileSyncTools';
var fileSyncTools = new FileSyncTools();

module.exports = {
    flags: {
        byHash: 'byHash',
        followSymbolicLinks: 'followSymbolic',
        help: 'help',
        includeHash: 'includeHash',
        includeOriginal: 'includeOriginal',
        verbose: 'verbose'
    },
    commands: {
        copyMissingFiles: function (path1, path2, options) {
            if (!(path1 || path2)) return FSUtils.errorAndExit(this.getInvalidArgumentsResponse());
            fileSyncTools.copyMissing(path1, path2, options, function (err, numFilesCoppied) {
              if (err) return FSUtils.errorAndExit('error: ' + err);
              console.info(clc.green.bold('complete ' + numFilesCoppied + ' files have been copied'));
            });
        },
        listFilesRecursive: function (path, options) {
            if (!path) return FSUtils.errorAndExit(this.getInvalidArgumentsResponse());
            fileSyncTools.listFilesRecursive(path, options, function (err, files) {
              if (err) return FSUtils.errorAndExit('error: ' + err);
              FSUtils.printFiles(files);
            });
        },
        listMissingFiles: function (path1, path2, options) {
            debug(util.format('listMisingFiles: "%s" "%s"', path1, path2));
            if (!(path1 || path2)) return FSUtils.errorAndExit(this.getInvalidArgumentsResponse());
            fileSyncTools.listMissingFiles(path1, path2, options, function (err, files){
              if (err) return FSUtils.errorAndExit('error: ' + err);
              FSUtils.printFiles(files, options);
            });
        },
        listDuplicateFiles: function (path1, path2, options) {
            if (!(path1 && path2)) return FSUtils.errorAndExit(this.getInvalidArgumentsResponse());
            if (!_.isObject(options)) {
              // command used with one path
              options = path2;
              path2 = path1;
            }
            debug(util.format('listDuplicateFiles: "%s" "%s"', path1, path2));
            fileSyncTools.listDuplicateFiles(path1, path2, options, function (err, files){
              if (err) return FSUtils.errorAndExit('error: ' + err);
              FSUtils.printFiles(files, options);
            });
        },
        help: function () {
            var strHelp = '\n' + this.getUsageStatement() + '\n\nCommands:\n';
            strHelp += this.getCommandList();
            console.info(strHelp);
        }
    },
    executeCommand: function (command, args, verbose) {
        // set verbosity
        debug('executing command ' + command);
        fileSyncTools.setVerbose(verbose);
        if (!this.hasCommand(command)) return FSUtils.errorAndExit('unrecognized command "' + command + '"');
        return this.commands[command].apply(this, args);
    },
    // returns string representation of available commands
    getCommandList: function () {
        var strCommands = '';
        _.each(this.commands, function (f, command) {
            strCommands += '   ' + command + '\n';
        });
        return strCommands;
    },
    getInvalidArgumentsResponse: function () {
        return 'invalid arguments\n' + this.getUsageStatement();
    },
    getUsageStatement: function () {
        var strFlags = '';
        _.each(this.flags, function (v, flag) {
            strFlags += util.format('[--%s]', flag);
        });
        return util.format('usage: %s %s <command> [<args>]', TITLE, strFlags);
    },
    hasCommand: function (command) {
        return !!this.commands[command];
    }
};
