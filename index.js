/**
* FileSyncTool.js
* Author: Christopher A Wininger
*
* Date: 8/30/2013
*
* An API for matching the contents of one directory to a second directory recursively
* Useful for creating backups and de-duplicating files in cases where you may want to
* transfer files from multiple systems and directories into a single folder
*
* For example backing up multiple music folders from different machines to a single shared
* Music folder on the network without duplicating files
*
* @type {exports} FileSyncTool
*/
module.exports = require(__dirname + '/lib/FileSyncTools.js');
