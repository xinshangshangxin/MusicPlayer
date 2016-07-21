'use strict';

var through2 = require('through2');

var _filenames = {};
function add(file, name, options) {
  name = name || 'default';
  options = options || {};

  if(options.overrideMode) {
    _filenames[name] = [];
  }
  _filenames[name] = _filenames[name] || [];
  _filenames[name].push({
    relative: file.relative,
    full: file.path,
    base: file.base
  });
  return _filenames;
}

function save(name, options) {
  options = options || {};
  return through2.obj(function(file, enc, done) {
    this.push(file);
    if(file.isNull()) {

    }
    if(file.isStream()) {

    }
    if(file.isBuffer()) {
      add(file, name, options);
    }
    return done(null, file);
  });
}


function getPath(fileNames, pathOption) {
  fileNames = fileNames || [];
  return fileNames.map(function(fileName) {
    return fileName[pathOption];
  });
}

function getFile(name, pathOption) {
  if(!name && !pathOption) {
    return _filenames;
  }
  if(!name) {
    return _filenames.map(function(file) {
      return getPath(file, pathOption);
    });
  }
  if(!pathOption) {
    return _filenames[name];
  }

  return getPath(_filenames[name], pathOption);
}

module.exports = save;
module.exports.get = getFile;