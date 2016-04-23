'use strict';

angular
  .module('shangAngularTemplate')
  .config(function($urlRouterProvider, $stateProvider) {
    //$urlRouterProvider.when('', '/');

    $stateProvider
      .state('home', {
        url: '',
        templateUrl: 'home/home.tpl.html',
        resolve: {
        }
      });
  });