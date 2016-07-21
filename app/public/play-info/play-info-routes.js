'use strict';

angular
  .module('musicPlayer')
  .config(function($urlRouterProvider, $stateProvider) {

    $stateProvider
      .state('home.play', {
        url: '',
        templateUrl: 'play-info/play-info.tpl.html',
        controller: 'playController'
      })
      .state('home.play.detail', {
        url: '/play',
        views: {
          playList: {
            templateUrl: 'play-info/play-list.tpl.html'
          },
          lrc: {
            templateUrl: 'play-info/lrc.tpl.html'
          }
        }
      });
  });