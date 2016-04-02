'use strict';

angular
  .module('shangAngularTemplate')
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/');

    $stateProvider
      .state('home', {
        url: '',
        templateUrl: 'home/home.tpl.html',
        resolve: {
        }
      });
  });