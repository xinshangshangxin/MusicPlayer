'use strict';

angular
  .module('musicPlayer', [
    'ngSanitize',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'ui.bootstrap',
    'ngResource',
    'ui.router',
    'angular-loading-bar',
    'ngAnimate',
    'pascalprecht.translate',
    'dndLists',
    'common'
  ])
  .config(function($locationProvider, $httpProvider, $translateProvider, $compileProvider) {
    //$locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('httpInjectorFactory');

    // languages
    $translateProvider.useStaticFilesLoader({
      prefix: '/languages/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('zh-hans');

    // electron
    if(nodeRequire) {
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|shang):|data:image\//);
    }
  })
  .run(function($rootScope, $state, httpInjectorFactory, SERVER_URL) {
    $rootScope.$state = $state;

    httpInjectorFactory.statusCodeRouter = {
      401: 'home',
      403: 'home'
    };
    httpInjectorFactory.setServerUrl(SERVER_URL);

    //electron
    if(nodeRequire) {
      var ipcRenderer = nodeRequire('electron').ipcRenderer;
      ipcRenderer.on('globalShortcut', function(event, args) {
        console.log('set ipcRenderer globalShortcut: ', args);
        $rootScope.$broadcast('globalShortcut', args);
      });
      console.log('electron global shortcut');
    }
    else {
      console.log('no electron, skip global shortcut');
    }
  });

