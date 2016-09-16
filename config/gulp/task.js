'use strict';

var gulp = require('gulp');
var path = require('path');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var utilities = require('./utilities');

var gulpConfig = require('./config.js');
var specConfig = null;       // 在环境初始化之后再读取配置
var config = null;

var $ = require('gulp-load-plugins')(
  {
    pattern: ['gulp-*', 'del', 'streamqueue']
    //,lazy: false
  });

$.utilities = utilities;
$.isBuild = false;
$.isStatic = false;
$.specConfig = specConfig;
$.config = config;
$.isNeedInjectHtml = false;

// set default env
gulpConfig.__alterableSetting__ = {};
copyAttrValue(gulpConfig.__alterableSetting__, gulpConfig.alterableSetting);
setDevEnv();

function copyAttrValue(obj, copyObj) {
  if(!obj || !copyObj) {
    return obj;
  }
  for(var attr in copyObj) {
    if(!copyObj.hasOwnProperty(attr)) {
      return;
    }
    obj[attr] = copyObj[attr];
  }
  return obj;
}

function getConfig() {
  config = gulpConfig.getCommonConfig();
  specConfig = gulpConfig.getSpecConfig();
  $.config = config;
  $.specConfig = specConfig;
}

function setDevEnv(done) {
  gulpConfig.alterableSetting.publicPath = 'app/public';
  getConfig();
  return done && done();
}

function changeSrc(src) {
  if(typeof src === 'string') {
    return path.join('**', src);
  }
  else {
    return src.map(function(value) {
      return path.join('**', value);
    });
  }
}

// global error handler
function errorHandler(error) {
  console.log(error);
  this.end();
  this.emit('end');
}


function injectHtmlDevErrorHandler(error) {
  console.log(error);
  $.isNeedInjectHtml = true;
  this.end();
  this.emit('end');
}

function validConfig(config, name) {
  name = name || 'src';
  return config[name] && config[name].length;
}


/**
 *
 * 特殊需求, 每个项目不同
 *
 */

gulp.task('theme', function(done) {
  if(!$.isBuild || !validConfig(specConfig.theme)) {
    return done();
  }
  return gulp.src(specConfig.theme.src, specConfig.theme.opt)
    .pipe($.cssnano())
    .pipe($.rev())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(utilities.saveStoreFile(specConfig.theme.storeFileNameSpaceName))
    .pipe(gulp.dest(specConfig.theme.dest));
});

gulp.task('userTask', gulp.series('theme'));


/**
 * end: 特殊需求
 */


gulp.task('browser-sync', function(done) {
  browserSync.init(config.browsersync.development);
  return done();
});

// no-op = empty function
gulp.task('no-op', function() {
});

gulp.task('clean', function(done) {
  return $.del(config.clean.src, done);
});

// 复制 lib css, 在build时起作用
gulp.task('libCss', function(done) {
  if(!$.isBuild || !validConfig(config.libCss)) {
    return done();
  }

  return gulp
    .src(config.libCss.src, config.libCss.opt)
    .pipe(gulp.dest(config.libCss.dest));
});

gulp.task('sass', function() {
  if(!validConfig(config.sass)) {
    return done();
  }
  return gulp.src(config.sass.src, config.sass.opt)
    .pipe($.if($.isBuild, $.replace(config.sass.subStr, config.sass.newStr)))
    .pipe($.sass())
    .on('error', $.sass.logError)
    .pipe(gulp.dest(config.sass.dest))
    .pipe($.if(!$.isBuild, reload({stream: true})));
});

gulp.task('less', function(done) {
  if(!validConfig(config.less)) {
    return done();
  }
  return gulp
    .src(config.less.src, config.less.opt)
    .pipe($.less({
      expand: true,
      ext: '.css'
    }))
    .pipe(gulp.dest(config.less.dest))
    .pipe($.if(!$.isBuild, reload({stream: true})));
});

gulp.task('injectHtml:dev', function(done) {

  var ignorePath = {
    ignorePath: config.injectHtmlDev.ignorePath
  };

  var arr = [{
    objectMode: true
  }];

  if(validConfig(config.libCss)) {
    var libCss = gulp.src(config.libCss.src.map(function(value) {
      return path.join(config.injectHtmlDev.libCssPrefix, value);
    }), {read: false});
    arr.push(libCss);
  }

  if(validConfig(config.injectHtmlDev, 'cssSource')) {
    arr.push(gulp.src(config.injectHtmlDev.cssSource, {read: false}));
  }

  if(validConfig(config.libJs) && config.injectHtmlDev.libJsPrefix) {
    var libJs = gulp.src(config.libJs.src.map(function(value) {
      return path.join(config.injectHtmlDev.libJsPrefix, value);
    }), {read: false});
    arr.push(libJs);
  }

  if(validConfig(config.specJs)) {
    var specJs = gulp.src(config.specJs.src, {read: false});
    arr.push(specJs);
  }

  if(validConfig(config.injectHtmlDev, 'jsSource')) {
    var userJs = gulp
      .src(config.injectHtmlDev.jsSource)
      .pipe($.angularFilesort())
      .on('error', errorHandler);

    arr.push(userJs);
  }

  if(arr.length <= 1 || !validConfig(config.injectHtmlDev)) {
    return done();
  }

  return gulp
    .src(config.injectHtmlDev.src, config.injectHtmlDev.opt)
    .pipe($.inject(
      $.streamqueue.apply($.streamqueue, arr),
      ignorePath
    ))
    .on('error', injectHtmlDevErrorHandler)
    .on('finish', function() {
      $.isNeedInjectHtml = false;
    })
    .pipe(gulp.dest(config.injectHtmlDev.dest));
});

gulp.task('images', function(done) {
  if(!validConfig(config.images)) {
    return done();
  }
  return gulp
    .src(config.images.src, config.images.opt)
    .pipe(gulp.dest(config.images.dest))
});

gulp.task('fonts', function(done) {
  if(!$.isBuild || !validConfig(config.fonts)) {
    return done();
  }
  return gulp
    .src(config.fonts.src)
    .pipe(gulp.dest(config.fonts.dest))
});

gulp.task('css', function(done) {

  if(!validConfig(config.injectHtmlProd, 'cssSource') || !config.injectHtmlProd.prodCssName) {
    return done();
  }


  var stream = gulp.src(config.injectHtmlProd.cssSource);

  var filters = config.injectHtmlProd.cssFilters;
  var f;
  for(var i = 0, l = filters.length; i < l; i++) {
    if(!filters[i].src || !filters[i].src.length) {
      continue;
    }
    f = $.filter(changeSrc(filters[i].src), {restore: true});

    if(typeof filters[i].newStr === 'function') {
      filters[i].newStr = filters[i].newStr($);
    }

    stream = stream
      .pipe(f)
      .pipe($.replace(filters[i].subStr, filters[i].newStr))
      .pipe(f.restore);
  }

  return stream
    .pipe($.concat(config.injectHtmlProd.prodCssName))
    .pipe($.cssnano())
    .pipe($.rev())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(gulp.dest(config.injectHtmlProd.cssDest));
});

gulp.task('cp', function(done) {

  if(!config.cp || !config.cp.length) {
    return done();
  }


  var arr = [];
  config.cp.forEach(function(item) {
    if(validConfig(item)) {
      if(item.staticDisabled) {
        return;
      }
      arr.push(function() {
        return gulp.src(item.src, item.opt)
          .pipe(gulp.dest(item.dest));
      });
    }
  });

  if(!arr.length) {
    return done();
  }

  gulp.series(
    gulp.parallel.apply(gulp.parallel, arr),
    function(cb) {
      cb();
      done();
    })();
});

// 前端js
gulp.task('js', function(done) {
  if(!validConfig(config.js)) {
    return done();
  }

  if(!$.isBuild) {
    return gulp.src(config.js.src, config.js.opt)
      .pipe($.jshint(config.jshintPath))
      .pipe($.jshint.reporter(utilities.jshintReporter));
  }

  var jssStreamQueue = [{
    objectMode: true
  }];

  if(validConfig(config.specJs)) {
    var specStream = gulp.src(config.specJs.src);
    jssStreamQueue.push(specStream);
  }

  if(validConfig(config.js)) {
    var stream = gulp.src(config.js.src, config.js.opt);
    var filters = config.js.filters;
    var f;
    for(var i = 0, l = filters.length; i < l; i++) {
      if(!filters[i].src || !filters[i].src.length) {
        continue;
      }
      f = $.filter(changeSrc(filters[i].src), {restore: true});

      if(typeof filters[i].newStr === 'function') {
        filters[i].newStr = filters[i].newStr($);
      }

      stream = stream
        .pipe(f)
        .pipe($.replace(filters[i].subStr, filters[i].newStr))
        .pipe(f.restore);
    }

    var scriptStream = stream.pipe($.jshint(config.jshintPath))
      .pipe($.jshint.reporter(utilities.jshintReporter))
      .pipe($.ngAnnotate())
      .pipe($.angularFilesort())
      .on('error', errorHandler);

    jssStreamQueue.push(scriptStream);
  }

  if(validConfig(config.html2js)) {
    var templateStream = gulp
      .src(config.html2js.src, config.html2js.opt)
      .pipe($.if(config.html2js.isHtmlmin, $.htmlmin(config.htmlminConfig)))
      .pipe($.angularTemplatecache(config.html2js.name, config.html2js.config))
      .pipe($.angularFilesort());

    jssStreamQueue.push(templateStream);
  }

  return $.streamqueue.apply($.streamqueue, jssStreamQueue)
    .pipe($.concat(config.injectHtmlProd.prodUserJsName))
    .pipe($.uglify(config.uglifyConfig))
    .pipe($.rev())
    .pipe($.rename({extname: '.min.js'}))
    .on('error', errorHandler)
    .pipe(gulp.dest(config.js.dest));
});

// 前端js进行jshint
gulp.task('jsCachedJshint', function(done) {
  if(!validConfig(config.js)) {
    return done();
  }

  return gulp.src(config.js.src, config.js.opt)
    .pipe($.cached('js')) // 只传递更改过的文件
    .pipe($.jshint(config.jshintPath))
    .pipe($.jshint.reporter(utilities.jshintReporter))
    .pipe($.remember('js')) // 把所有的文件放回 stream
});


gulp.task('libJs', function(done) {
  if(!validConfig(config.libJs) || !config.injectHtmlProd.prodLibJsName) {
    return done();
  }

  return gulp.src(config.libJs.src, config.libJs.opt)
    .pipe($.concat(config.injectHtmlProd.prodLibJsName))
    .pipe($.uglify(config.uglifyConfig))
    .pipe($.rev())
    .pipe($.rename({extname: '.min.js'}))
    .on('error', errorHandler)
    .pipe(gulp.dest(config.libJs.dest));
});

gulp.task('injectHtml:prod', function() {
  var injectSource = gulp.src(config.injectHtmlProd.injectSource, {read: false});
  return gulp
    .src(config.injectHtmlProd.src, config.injectHtmlProd.opt)
    .pipe($.inject(injectSource, {
      ignorePath: config.injectHtmlProd.injectIgnorePath
    }))
    .pipe($.if(config.injectHtmlProd.isHtmlmin, $.htmlmin(config.htmlminConfig)))
    .pipe(gulp.dest(config.injectHtmlProd.dest));
});

gulp.task('server', function(done) {
  if($.isStatic) {
    return done();
  }
  var f = $.filter(['**/*.js'], {restore: true});

  if(!$.isBuild || !validConfig(config.server)) {
    return gulp
      .src(config.server.src, config.server.opt)
      .pipe(f)
      .pipe($.jshint(config.jshintPathApp))
      .pipe($.jshint.reporter(utilities.jshintReporter))
      .pipe(f.restore);
  }

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe(f)
    .pipe($.jshint(config.jshintPathApp))
    .pipe($.jshint.reporter(utilities.jshintReporter))
    .pipe(f.restore)
    .pipe(gulp.dest(config.server.dest))
});

// start watchers
gulp.task('watchers', function(done) {
  // less
  if(config.less.watcherPath) {
    gulp.watch(config.less.watcherPath, gulp.series('less'));
  }
  // 后端js变动
  if(config.server.jsWatch) {
    gulp.watch(config.server.jsWatch, gulp.series('server'));
  }

  if(config.browsersync.development && config.browsersync.development.files) {
    var injectHtmlDevTimer = null;
    gulp.watch(config.browsersync.development.files)
      .on('change', function(filePath) {
        // js文件需要 jshint
        if(/\.js/.test(filePath)) {
          gulp.series('jsCachedJshint')();
        }
        
        if($.isNeedInjectHtml) {
          console.log('NeedInjectHtml');
          gulp.series('injectHtml:dev')();
        }
      }) // 增加文件需要重新生成依赖
      .on('add', function() {
        clearTimeout(injectHtmlDevTimer);
        injectHtmlDevTimer = setTimeout(function() {
          gulp.series('injectHtml:dev')();
        }, 200);
      })// 删除文件需要重新生成依赖
      .on('unlink', function() {
        clearTimeout(injectHtmlDevTimer);
        injectHtmlDevTimer = setTimeout(function() {
          gulp.series('injectHtml:dev')();
        }, 200);
      });
  }

  done();
});

gulp.task('watchers:sass', function() {
  gulp.watch(config.sass.watcherPath, ['sass']);
});

gulp.task('build', gulp.series(
  function setBuildEnv(done) {
    if(!$.isStatic) {
      copyAttrValue(gulpConfig.alterableSetting, gulpConfig.__alterableSetting__);
    }
    getConfig();
    $.isBuild = true;
    return done();
  },
  'clean',
  'less',
  'cp',
  //'userTask',
  gulp
    .parallel(
      'libCss',
      'js',
      'images',
      'fonts',
      'libJs',
      'server'
    ),
  'css',
  'injectHtml:prod'
));

gulp.task('buildServer', gulp.series(
  function setBuildEnv(done) {
    if(!$.isStatic) {
      copyAttrValue(gulpConfig.alterableSetting, gulpConfig.__alterableSetting__);
    }
    getConfig();
    $.isBuild = true;
    return done();
  },
  'clean',
  gulp
    .parallel(
      'server'
    ),
  'injectHtml:prod'
));

gulp.task('prod', gulp.series('build'));

gulp.task('static', gulp.series(
  function setStaticEnv(done) {
    $.isStatic = true;
    gulpConfig.alterableSetting.basePath = 'static';
    gulpConfig.alterableSetting.publicPath = gulpConfig.alterableSetting.basePath;
    gulpConfig.alterableSetting.viewPath = gulpConfig.alterableSetting.basePath;
    gulpConfig.alterableSetting.noHtml5Mode = true;
    gulpConfig.alterableSetting.noServer = true;
    return done();
  },
  'build'
));

gulp.task('default', gulp.series(
  setDevEnv,
  'clean',
  gulp.parallel(
    'less',
    'js'
  ),
  //'userTask',
  'injectHtml:dev'
));


gulp.task('dev', gulp.series(
  'default',
  'browser-sync',
  'watchers'
));

gulp.task('quickStart', gulp.series(
  setDevEnv,
  'browser-sync',
  'watchers'
));
