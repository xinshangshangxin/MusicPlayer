var musicplayer = angular.module('MusicPlayer', ['ui.router', 'MusicModule']);

musicplayer.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/index');

    $stateProvider
        .state('index', {
            url: '/index',
            views: {
                '': {
                    templateUrl: 'tpls/main.html'
                },
                'lrc@index': {
                    templateUrl: 'tpls/lrc.html'
                },
                'list@index': {
                    templateUrl: 'tpls/list.html'
                },
                'control@index': {
                    templateUrl: 'tpls/control.html'
                },
                'search@index': {
                    templateUrl: 'tpls/search.html'
                }
            }
        });
});
