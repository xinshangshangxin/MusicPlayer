'use strict';


angular
  .module('musicPlayer')
  .constant('SERVER_URL', '')
  .constant('PLAY_URL_PREFIX', '/api/v1/music/play')
  .constant('MUSIC_TYPES', {
    1: 'local',
    2: 'xiami',
    3: 'qq',
    4: '163'
  })
;
