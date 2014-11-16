/**
 * Utilities/helper functions to use throughout this library
 *
 * @type {{errorAndExit: Function}}
 */
var clc = require("cli-color"),
    _ = require('underscore');

module.exports = {
    errorAndExit: function (errMsg) {
        console.error(clc.red(errMsg));
        return process.exit(1);
    },
    printFiles: function (files, options) {
        var options = options || {},
            filteredFiles = {},
            combineKey = 'fileName';
        if (options.byHash) combineKey = 'fileHash';

        _.each(files, function (f) {
            if (!filteredFiles[f[combineKey]]) {
                filteredFiles[f[combineKey]] = {
                    fileName: f.fileName,
                    fullPathsString: '\n   ' + f.fullPath + (f.warning ? clc.red('-- hash: ' + f.warning + '[' + f.fileHash + ']') : '')
                };
                return;
            }
            filteredFiles[f[combineKey]].fullPathsString +=  '\n   ' + f.fullPath + (f.warning ? clc.red('-- hash: ' + f.warning + '[' + f.fileHash + ']') : '')
        });


        _.each(filteredFiles, function (fileEntry, key) {
            var title = fileEntry.fileName;
            if (options.byHash) title += ' (' + key + ')';
            console.log(clc.bold(title) +  fileEntry.fullPathsString);
        });
    }
};