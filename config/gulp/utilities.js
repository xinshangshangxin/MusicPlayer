'use strict';

var chalk = require('chalk');
var logSymbols = require('log-symbols');
var notifier = require('node-notifier');
var through2 = require('through2');

var _filenames = {};

var svc = {
  jshintReporter: {
    reporter: function(result, config, options) {
      var total = result.length;
      var ret = '';
      var errorCount = 0;
      var warningCount = 0;

      options = options || {};

      ret += result.map(function(el, i) {
          var err = el.error;
          // E: Error, W: Warning, I: Info
          var isError = err.code && err.code[0] === 'E';

          var line = [
            chalk.yellow(el.file + ':' + err.line + ':' + err.character),
            '\n',
            isError ? chalk.red(err.reason) : chalk.blue(err.reason)
          ];

          if(options.verbose) {
            line.push(chalk.gray('(' + err.code + ')'));
          }

          if(isError) {
            errorCount++;
          }
          else {
            warningCount++;
          }

          return line.join('    ');
        }).join('\n') + '\n\n';

      if(total > 0) {
        if(errorCount > 0) {
          ret += '  ' + logSymbols.error + '  ' + errorCount + ' error'
        }
        ret += '  ' + logSymbols.warning + '  ' + warningCount + ' warning';
      }
      else {
        ret += '  ' + logSymbols.success + ' No problems';
        ret = '\n' + ret.trim();
      }

      if(errorCount + warningCount > 0) {
        notifier.notify({
          'title': ret.replace(/.*\//gi, ''),
          'subtitle': (errorCount ? ('err: ' + errorCount) : '') + (warningCount ? (' warning: ' + warningCount) : ''),
          'message': svc.dateFormat('hh:mm:ss'),
          'sound': false, // Case Sensitive string of sound file (see below)
          'wait': false // if wait for notification to end
        });
      }

      console.log('\n' + ret + '\n');
    }
  },
  dateFormat: function(fmt, date) {
    date = date || new Date();
    var o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      'S': date.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
      if(new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }

    return fmt;
  },
  addStoreFile: function(file, name, options) {
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
  },
  saveStoreFile: function(name, options) {
    options = options || {};
    return through2.obj(function(file, enc, done) {
      this.push(file);
      if(file.isNull()) {

      }
      if(file.isStream()) {

      }
      if(file.isBuffer()) {
        svc.addStoreFile(file, name, options);
      }
      return done(null, file);
    });
  },
  getStorePath: function(fileNames, pathOption) {
    fileNames = fileNames || [];
    return fileNames.map(function(fileName) {
      return fileName[pathOption];
    });
  },
  getStoreFile: function(name, pathOption) {
    if(!name && !pathOption) {
      return _filenames;
    }
    if(!name) {
      return _filenames.map(function(file) {
        return svc.getStorePath(file, pathOption);
      });
    }
    if(!pathOption) {
      return _filenames[name];
    }

    return svc.getStorePath(_filenames[name], pathOption);
  },
};

module.exports = svc;