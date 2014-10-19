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

var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	debug = require('debug')('FileSyncTools'),
	cp = require('cp'),
	Path = require('path'),
	mkdirp = require('mkdirp'),
	ProgressBar = require('progress'),
    crypto = require('crypto');

module.exports = FileSyncTool;

function FileSyncTool () {}
_.extend(FileSyncTool.prototype, {
	/**
	 * copyMissing
	 *
	 * Copies any files missing from the root of path2 to the root of path2.
	 * This includes anything in the directory tree above the root of path2.
	 * One major difference between this and rsync or normal recursive copy
	 * behavior is that files are only considered missing if they are found
	 * no where beneath path2's directory tree. Files under path2 in a diferent
	 * location are not considered missing
	 *
	 * @param path1
	 * @param path2
	 * @param options object includes (boolean followSymbolicLinks)
	 * @param complete
	 */
	copyMissing: function (path1, path2, options, complete){
		var self = this,
			cnt = 0;
		options = options || {};

		var errored = false;
		_complete = function (err) {
			if (err) errored = true;
			if (_.isFunction(complete)) complete(err, cnt);
		};
		this.listMissingFiles(path1, path2, options, function (err, files) {
			if (err) return complete(err);
			if (files.length === 0) return complete(null, cnt);
			self.log(files.length + ' missing files found');
			var _processedFile = _.after(files.length, _complete);
			var progressBar = new ProgressBar('  copying [:bar] :percent', {
				complete: '=',
				incomplete: ' ',
				width: 20,
				total: files.length
			});
			_.each(files, function (f) {
				if (errored) return;
				self.log('copying ' + f.fullPath + ' to ' + Path.join(path2, f.fileName));
				var subRoot = f.fullPath.split(path1)[1];
				var newPath = Path.join(path2, subRoot);
				mkdirp(Path.dirname(newPath), function (err) {
					debug('created directory ' + Path.dirname(newPath));
					if (err) return _complete('error making directory "' + Path.dirname(newPath) + '": ' + err);
					cp(f.fullPath, newPath, function (err){
						if (err) return _complete('error copying file "' + f.fullPath + '": ' + err);
						self.log('copied ' + f.fileName + ' to ' + Path.join(newPath, f.fileName));
						progressBar.tick();
						cnt++;
						_processedFile();
					});
				});
			});
		});
	},
	/**
	 * listFilesRecursively
	 *
	 * Recursively lists all files under the directory specified
	 *
	 * @param path string indicating the path to look under
	 * @param options object includes (boolean followSymbolicLinks)
	 * @param complete function called when operation is complete
	 * @param rtnFiles array of objects [{ fileName: 'string', fullPath: 'string' }, ...]
	 */
   	listFilesRecursive: function (path, options, complete, rtnFiles) {
		debug('running listFilesRecursive with options: ' + JSON.stringify(options));
		var self = this;
		options = options || options;
		rtnFiles = rtnFiles || [];
		fs.readdir(path, function (err, files){
			if (err) return complete('could not read directory ' + path);

			var _doneProcessing = _.after(files.length, function () {
				complete(null, rtnFiles);
			});
			if (files.length === 0) return complete(null, []);
			_.each(files, function (file) {
				fs.lstat(Path.join(path, file), function (err, lstat) {
					if (err) return complete('could not process ' + file + ': ' + err);

					fs.stat(Path.join(path, file), function (err, stat) {
						if (err) return complete('could not process ' + file + ': ' + err);

						if (!options.followSymbolic && lstat.isSymbolicLink()) {
							debug('skipping symbolic link ' + Path.join(path, file));
							return _doneProcessing();
						}
						if (stat.isDirectory()) {
							self.listFilesRecursive(Path.join(path, file), options, function (err, files) {
								if (err) return complete(err);
								_doneProcessing();
							}, rtnFiles);
						} else {
                            if (options.includeHash === true) {
                                // full search calculate file hash
                                var fullPath = Path.resolve(__dirname, Path.join(path,file));
                                var fd = fs.createReadStream(fullPath);
                                var hash = crypto.createHash('sha1');
                                hash.setEncoding('hex');
                                fd.on('end', function() {
                                    hash.end();
                                    rtnFiles.push({fileName: file, fullPath: Path.join(path, file), fileHash: hash.read() });
                                    _doneProcessing();
                                });
                                fd.on('error', function (err) {
                                    hash.end();
                                    console.warn('could not read ' + file +':' + err);
                                    rtnFiles.push({fileName: file, fullPath: Path.join(path, file) });
                                    _doneProcessing();
                                });
                                fd.pipe(hash);
                            } else {
                                // quick search exclude hash
                                console.log('!!! did read ' + fullPath);
                                rtnFiles.push({fileName: file, fullPath: Path.join(path, file)});
                                _doneProcessing();
                            }
						}
					});
				});
			});
		});
	},
	/**
	 * listMissingFiles
	 *
	 * lists recursively all files under path1 which are not present recursively under path2
	 *
	 * @param path1 string the first path to look under
	 * @param path2 string the second path to match against the first
	 * @param options object includes (boolean followSymbolicLinks)
	 * @param complete function callback indicating the operation is complete
	 */
	listMissingFiles: function (path1, path2, options, complete){
		_compareFiles(path1, path2, true, this, options, complete);
	},
	/**
	 * listDuplicateFiles
	 *
	 * lists recursively all files under path which are duplicated recursively under path2
	 *
	 * @param path1 string the first path to look under
	 * @param path2 string the second path to match against the first
	 * @param options object includes (boolean followSymbolicLinks)
	 * @param complete function callback indicating the operation is complete
	 */
	listDuplicateFiles: function (path1, path2, options, complete) {
		debug('searching for duplicates');
		_compareFiles(path1, path2, false, this, options, complete);
	},
	log: function (msg) {
		if (this._verbose) console.info(msg);
	},
	setVerbose: function (val) {
		this._verbose = val;
	}
});

// --- Private Helper functions ---
function _compareFiles (path1, path2, missing, fileSync, options, complete) {
	complete = complete || function () {};
	if (!(path1 || path2)) return complete('missing parameters');
	var files1, files2;

	var _processedList = _.after(2, function () {
		complete(null, _findDiffOrOverlap(files1, files2, missing));
	});
	fileSync.listFilesRecursive(path1, options, function (err, files) {
		if (err) return complete(err);
		files1 = files;
		_processedList();
	});
	fileSync.listFilesRecursive(path2, options, function (err, files) {
		if (err) return complete(err);
		files2 = files;
		_processedList();
	});
}
/**
 * Will either find the difference between two sets of files
 * or the overlap between the two files depending on the flag
 * @param files1
 * @param files2
 * @param missing
 * @returns {Array}
 * @private
 */
function _findDiffOrOverlap(files1, files2, missing) {
	var diff = [];
	_.each(files1, function (file) {
		var copy = _.find(files2, function (f) {
			return file.fileName === f.fileName;
		});

		debug('missing: ' + missing + '; copy found: ' + !! copy);
		if (missing) {
            // searching for missing files
            if (!copy) diff.push(file);
        } else if (!missing) {
            // searching for duplicates
            if (copy) {
                diff.push(file);
            }
        }
	});

	return diff;
}