var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var tools = require('./tools');
var through = require('through2');
var chalk = require('chalk');
var gutil = require('gulp-util');

module.exports = function(options) {

    options = options || {};
    var first = true
      , ignoreExtensions = [].concat(options.ignoreExtensions)
      , ignoreFiles = [].concat(options.ignoreFiles)
      ;

    return through.obj(function (file, enc, callback) {

        if (options.rootDir === undefined) options.rootDir = file.base;

        if (first) {
            gutil.log('gulp-rev-all:', 'Root directory [', options.rootDir, ']');
            first = !first;
        }


        if (file.isNull()) {
            callback(null, file);
            return;
        } else if (file.isStream()) {
            throw new Error('Streams are not supported!');
            callback(null, file);
            return;
        }

        // Only process references in these types of files, otherwise we'll corrupt images etc
        switch(path.extname(file.path)) {
            case '.js':
            case '.css':
            case '.html':
            case '.php':
                tools.revReferencesInFile(file, options.rootDir, ignoreExtensions);
        }

        if ((ignoreExtensions.indexOf(path.extname(file.path)) === -1) && (ignoreFiles.indexOf(path.basename(file.path)) === -1)) {
          var filenameReved = path.basename(tools.revFile(file.path));
          var base = path.dirname(file.path);
          var oldPath = file.path;
          file.path = path.join(base, filenameReved);
          if (options.remove) {
            fs.unlink(oldPath, function(err) {
              if (err) {
                gutil.log('gulp-rev-all:', 'Error deleting file [', oldPath, ']', err);
              } else {
                gutil.log('gulp-rev-all:', 'Deleted file [', oldPath, ']');
              }
            });
          }
        }

        callback(null, file);

    });


};
