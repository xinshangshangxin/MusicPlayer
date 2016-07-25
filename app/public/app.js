'use strict';

angular
  .module('shangAngularTemplate', [
    'ui.bootstrap',
    'ngResource',
    'ui.router',
    'angular-loading-bar',
    'ngAnimate',
    'pascalprecht.translate',
    'common'
  ])
  .config(function($locationProvider, $httpProvider, $translateProvider) {
    //$locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('httpInjectorFactory');

    // languages
    $translateProvider.useStaticFilesLoader({
      prefix: '/languages/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('zh-hans');

  })
  .run(function($rootScope, $state, httpInjectorFactory, SERVER_URL) {
    $rootScope.$state = $state;

    httpInjectorFactory.statusCodeRouter = {
      401: 'home',
      403: 'home'
    };
    httpInjectorFactory.setServerUrl(SERVER_URL);
  });

