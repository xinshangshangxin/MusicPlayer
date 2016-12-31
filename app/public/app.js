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
    if(window.nodeRequire) {
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|shang):|data:image\//);
    }
  })
  .run(function($rootScope, $stateParams, $state, $window, httpInjectorFactory, SERVER_URL) {
    // global variable
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // languages loaded
    $rootScope.initialingServiceCount = $rootScope.initialingServiceCount || 0;
    $rootScope.initialingServiceCount += 1;
    $rootScope.$on('$translateLoadingSuccess', function () {
      $rootScope.initialingServiceCount -= 1;
    });

    // http inject
    httpInjectorFactory.statusCodeRouter = {
      401: 'home',
      403: 'home'
    };
    httpInjectorFactory.setServerUrl(SERVER_URL);

    //electron
    $rootScope.isElectron = function () {
      return $window.nodeRequire;
    };

    if($window.nodeRequire) {
      $window.electron = $window.nodeRequire('electron');
      var ipcRenderer = $window.electron.ipcRenderer;
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

