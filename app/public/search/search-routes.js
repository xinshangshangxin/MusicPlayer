'use strict';

angular
  .module('musicPlayer')
  .config(function($urlRouterProvider, $stateProvider) {

    $stateProvider
      .state('home.search', {
        url: '/search?key',
        controller: 'searchController',
        templateUrl: 'search/search.tpl.html'
      })
      .state('home.search.redirect', {
        url: '/?key',
        controller: 'searchController',
        templateUrl: 'search/search.tpl.html'
      });
  });