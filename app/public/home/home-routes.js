'use strict';

angular
  .module('musicPlayer')
  .config(function($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.when('', '/play');
    $urlRouterProvider.when('/', '/play');
    // $urlRouterProvider.otherwise('/play');

    $stateProvider
      .state('home', {
        url: '',
        templateUrl: 'home/home.tpl.html',
        controller: 'homeController'
      });
  });
