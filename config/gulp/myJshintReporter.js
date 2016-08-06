'use strict';

var chalk = require('chalk');
var logSymbols = require('log-symbols');

module.exports = {
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

    console.log('\n' + ret + '\n');
  }
};