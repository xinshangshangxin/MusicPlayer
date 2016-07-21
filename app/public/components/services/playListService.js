'use strict';


angular
  .module('musicPlayer')
  .service('playListService', function($q, localSaveService) {
    var that = this;
    this.favorList = {};
    this.createFavor = createFavor;
    this.deleteFavor = deleteFavor;
    this.editFavor = editFavor;
    this.queryFavor = queryFavor;
    this.getFavor = getFavor;
    this.addSongToFavor = addSongToFavor;
    this.deleteSongFromFavor = deleteSongFromFavor;
    this.saveSong = saveSong;

    init();


    /**
     * favorListName 所有favor的名称
     * favor_${name} 某个favor下的歌曲
     */
    function init() {
      var favorListName = localSaveService.get('favorListName') || [];
      _.forEach(favorListName, function(name) {
        that.favorList[name] = localSaveService.get('favor_' + name) || [];
      });

      if(!that.favorList.temp) {
        that.favorList.temp = [];
        saveFavorNames();
      }

      console.log('that.favorList.temp: ', that.favorList.temp);
    }

    function createFavor(name) {
      return $q(function(resolve, reject) {
        if(that.favorList[name]) {
          return reject(new Error('已经存在'));
        }

        that.favorList[name] = [];
        saveFavorNames();
        resolve(that.favorList[name]);
      });
    }

    function deleteFavor(name) {
      var ori = that.favorList[name];
      delete that.favorList[name];
      saveFavorNames();
      return ori;
    }

    function editFavor(name, newName) {
      return $q(function(resolve, reject) {
        var origin = that.favorList[name];

        if(that.favorList[name]) {
          return reject(new Error('已经存在'));
        }

        that.favorList[newName] = origin;
        saveFavorNames();
        resolve(that.favorList[newName]);
      });

    }

    function queryFavor() {
      return that.favorList;
    }

    function getFavor(name) {
      name = name || 'temp';
      return $q(function(resolve, reject) {
        if(!that.favorList[name]) {
          return reject(new Error('不存在'));
        }

        return resolve(that.favorList[name]);
      });
    }

    function addSongToFavor(song, index, favorName) {
      favorName = favorName || 'temp';
      return getFavor(favorName)
        .then(function(favor) {
          if(_.find(favor, {id: song.id, type: song.type})) {
            return $q.reject('已经存在');
          }

          index = index || favor.length;
          favor.splice(index, 0, song);
          return favor;
        })
        .then(function(favor) {
          saveSong(favor, favorName);
          return favor;
        });
    }

    function deleteSongFromFavor(song, favorName) {
      favorName = favorName || 'temp';
      return getFavor(favorName)
        .then(function(favor) {
          var index = _.findIndex(favor, {id: song.id, type: song.type});

          if(index === -1) {
            return $q.reject('没有找到');
          }

          favor.splice(index, 1);
          return favor;
        })
        .then(function(favor) {
          saveSong(favor, favorName);
          return favor;
        });
    }

    function saveFavorNames() {
      var favorNames = _.map(that.favorList, function(value, name) {
        return name;
      });
      localSaveService.set('favorListName', favorNames);
    }

    function saveSong(favorSongs, favorName) {
      favorName = favorName || 'temp';
      localSaveService.set('favor_' + favorName, favorSongs);
    }

  });