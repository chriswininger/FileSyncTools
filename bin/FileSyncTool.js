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

       if (commandArray.length !== 3) {
           console.error('invalid parameters\nusage: FileSyncTool ');
       }
   }
});