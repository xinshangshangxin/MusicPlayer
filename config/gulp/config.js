'use strict';
var path = require('path');

/****** start: 用户配置***********/

var alterableSetting = {  // prod 的 基础路径
  basePath: 'production/',
  publicPath: 'production/public/',
  viewPath: 'production/views/'
};


function getCommonConfig() {
  return {
    clean: {                   // 清除生成文件的路径
      src: [
        alterableSetting.basePath + '**/*',
        'app/public/styles/',
        '!' + alterableSetting.basePath + '/.git/',
        '!' + alterableSetting.basePath + '/CNAME',
        '!' + alterableSetting.basePath + '/Makefile'
      ]
    },
    sass: {
      watcherPath: [],    // watch:sass 文件路径
      src: [],
      opt: {},
      subStr: '',
      newStr: '',            // prod环境下 替换fonts后的路径
      dest: ''
    },
    less: {
      watcherPath: [
        'less/**/*.less',
        'app/public/common/**/*.less',
        'app/public/components/**/*.less'
      ],    // watch:sass 文件路径
      src: [
        'less/variables.less',
        'app/public/common/**/*.less',
        'app/public/components/**/*.less'
      ],
      opt: {},
      dest: 'app/public/styles'
    },
    injectHtmlDev: {            // development环境
      src: 'index.html',
      opt: {
        cwd: 'app/views',
        base: 'app/views'
      },
      cssSource: [                    // 需要引入的css
        'app/public/styles/**/*.css'
      ],
      cssSourceSort: function (a, b) {
        if(a.path < b.path) {
          return 1;
        }
        if(a.path > b.path) {
          return -1;
        }
        return 0;
      },
      jsSource: [         // 需要引入的js, config.specJs会加载在其上面
        'app/public/**/*.js',
        '!app/public/vendor/**/*',
        '!app/public/framework/**/*'
      ],
      libJsPrefix: 'app/public/vendor',  // libJS  依赖于 config.libJs.src; 需要加上前缀
      libCssPrefix: 'app/public',       // libCss  依赖于 config.libCss.src; 需要加上前缀
      ignorePath: 'app/public/',       // 路径去除, 相当于 base
      dest: 'app/views'
    },
    libCss: {             // lib css 需要引入的的css
      src: [              // src 可以为空数组
        'framework/paper/dist/bootstrap.min.css',
        'vendor/angular-loading-bar/build/loading-bar.min.css',
        'vendor/font-awesome/css/font-awesome.min.css',
        'vendor/videogular-themes-default/videogular.min.css'
      ],
      opt: {
        cwd: 'app/public/'
      },
      dest: 'app/public/styles'
    },
    libJs: {              // lib js, 需要按照顺序书写
      'src': [
        'angular/angular.min.js',
        'angular-sanitize/angular-sanitize.min.js',
        'angular-animate/angular-animate.min.js',
        'angular-resource/angular-resource.min.js',
        'angular-ui-router/release/angular-ui-router.min.js',
        'angular-bootstrap/ui-bootstrap-tpls.min.js',
        'angular-loading-bar/build/loading-bar.min.js',
        'angular-translate/angular-translate.min.js',
        'angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
        'angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
        'angular-touch/angular-touch.min.js',
        'videogular/videogular.min.js',
        'videogular-controls/vg-controls.min.js',
        'angular-pageslide-directive/dist/angular-pageslide-directive.min.js',
        'lodash/dist/lodash.min.js'
      ],
      'opt': {
        'cwd': 'app/public/vendor',
        'base': 'app/public/vendor'
      },
      dest: path.join(alterableSetting.publicPath, 'js')          // libJs在prod环境下才需要 输出, 故dest为 prod环境的dest
    },
    specJs: {
      src: [                 // 需要引入的且没有依赖项的js,如i18n,  [可以为空数组]

      ]
    },
    js: {                                   // 用户写的 js
      src: [
        '**/*.js',
        '!vendor/**/*',
        '!framework/**/*'
      ],
      opt: {
        cwd: 'app/public/',
        base: 'app/public/'
      },
      filters: [{
        src: ['app.js'],
        subStr: '$locationProvider.html5Mode(true);',
        newStr: '$locationProvider.html5Mode(' + !alterableSetting.noHtml5Mode + ');'
      }, {
        src: ['components/constants.js'],
        subStr: '.constant(\'SERVER_URL\', \'\')',
        newStr: '.constant(\'SERVER_URL\', \'' + (alterableSetting.noServer ? '' : '') + '\')'
      }, {
        src: ['this_is_a_template.js'],
        subStr: /musicPlayer/,
        newStr: function($) {
          var filepath = $.utilities.getStoreFile($.specConfig.theme.storeFileNameSpaceName, 'relative') || [];
          return filepath[0];
        }
      }],
      dest: path.join(alterableSetting.publicPath, 'js')        // userJs在prod环境下才需要 输出, 故dest为 prod环境的dest
    },
    images: {
      src: ['**/*'],
      opt: {
        cwd: 'app/public/images',
        base: 'app/public'
      },
      dest: alterableSetting.publicPath
    },
    fonts: {
      src: [
        'app/public/vendor/bootstrap/fonts/**/*',
        'app/public/vendor/font-awesome/fonts/**/*',
        'app/public/vendor/videogular-themes-default/fonts/**/*',
      ],
      dest: path.join(alterableSetting.publicPath, 'styles/fonts')
    },
    injectHtmlProd: {
      src: 'index.html',
      opt: {
        cwd: 'app/views',
        base: 'app/views'
      },
      cssSource: [                    // 需要引入的cs
        'app/public/styles/bootstrap.min.css',
        'app/public/styles/**/*.css',
      ],
      lastCssSource: [
        'app/public/styles/variables.css',
      ],
      injectSource: [
        path.join(alterableSetting.publicPath, 'styles/**/*.css'),
        path.join(alterableSetting.publicPath, 'js/lib*.min*.js'),
        path.join(alterableSetting.publicPath, 'js/user*.min*.js')
      ],
      cssDest: path.join(alterableSetting.publicPath, 'styles'),
      cssFilters: [{
        src: ['bootstrap.min.css', 'font-awesome.min.css'],
        subStr: '../fonts/',
        newStr: 'fonts/'
      }],
      dest: alterableSetting.viewPath,
      injectIgnorePath: alterableSetting.publicPath,
      isHtmlmin: true,
      prodCssName: 'production',     // css压缩后的名称(无需写 min.css)
      prodUserJsName: 'user',        // 用户js压缩后的名字(无需写 min.js)
      prodLibJsName: 'lib'         // lib js 压缩后的名字 (无需写 min.js)
    },
    html2js: {
      src: [
        '**/*.html',
        '!index.html',
        '!vendor/**/*',
        '!framework/**/*'
      ],
      opt: {
        'cwd': 'app/public/',
        'base': 'app/'
      },
      config: {
        module: 'musicPlayer',
        transformUrl: function(url) {
          return url.replace(/.*[\/\\]public[\/\\]/, '');
        }
      },
      isHtmlmin: true,
      name: 'template-app.js',
      dest: path.join(alterableSetting.publicPath, 'js')
    },
    server: {
      jsWatch: [
        'app/**/*.js',
        'config/**/*',
        '!app/public/**/*'
      ],
      src: [
        '**/*',
        '!public/**/*',
        '!views/**/*',
        '!index.html'
      ],
      opt: {
        'cwd': 'app/',
        'base': 'app/'
      },
      dest: alterableSetting.basePath
    },
    revAll: {
      src: [
        '**/*',
        '!imagas/**/*',
        '!fonts/**/*',
        '!index.html'
      ],
      opt: {
        'cwd': alterableSetting.publicPath,
        'base': alterableSetting.publicPath
      },
      dest: alterableSetting.publicPath
    },
    cp: [{
      staticDisabled: true,
      src: [
        'config/**/*'
      ],
      opt: {
        'cwd': 'app/',
        'base': 'app/'
      },
      dest: alterableSetting.basePath
    },{
      src: [
        'languages/**/*'
      ],
      opt: {
        'cwd': 'app/public',
        'base': 'app/public'
      },
      dest: alterableSetting.publicPath
    }],
    browsersync: {
      development: {
        proxy: 'http://127.0.0.1:12345',
        online: true,
        port: 13370,
        files: [
          'app/public/**/*',
          '!app/public/styles/**/*',
          'app/views/**/*'
        ]
      }
    },
    minifyCssConfig: {                        // 压缩css配置
      keepSpecialComments: 0
    },
    uglifyConfig: {                           // 压缩js配置
      compress: {
        drop_console: true
      }
    },
    htmlminConfig: {
      collapseWhitespace: true,
      removeComments: true
    },
    jshintPath: 'config/gulp/.jshintrc',        // jshintrc 的路径, 相对gulpfile.js
    jshintPathApp: 'config/gulp/.jshintrc_app'  // jshintrc 的路径, 相对gulpfile.js
  };
}

/****** end: 用户配置***********/


function getSpecConfig() {
  return {
    theme: {
      src: [],
      opt: {
        cwd: 'app/public',
        base: 'app/public'
      },
      dest: alterableSetting.publicPath,
      storeFileNameSpaceName: 'nightTheme'
    }
  };
}

module.exports = {
  alterableSetting: alterableSetting,
  getCommonConfig: getCommonConfig,
  getSpecConfig: getSpecConfig
};
