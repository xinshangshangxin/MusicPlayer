'use strict';

angular
  .module('musicPlayer')
  .directive('lrc', function($timeout, $window) {
    return {
      restrict: 'AE',
      scope: {
        lrcStr: '=lrcStr',
        mediaElement: '=mediaElement'
      },
      templateUrl: 'common/lrc/lrc.tpl.html',
      link: function(scope, element) {
        let audio = scope.mediaElement[0];
        let prefixHeight = 100;
        let generateLrcUniqueClass = lrcUniqueClass();
        // 因为lrc上有动画, 直接通过元素P 会获取上一次歌词的残留,故对每个歌词使用独立的class
        scope.lrcUniqueClass  = generateLrcUniqueClass();

        scope.lrcIndex = 0;
        scope.marginTop = {
          'margin-top': prefixHeight + 'px'
        };
        scope.load = lrcLoad;

        angular.element($window).bind('resize', function() {
          console.log('window resize, lrc recalculate!!');
          setTop(scope.lrcList, prefixHeight);
        });

        scope.$watch('lrcStr', function(newValue) {
          console.log('lrcStr change: ', scope.lrcStr && scope.lrcStr.length);
          scope.lrcUniqueClass = generateLrcUniqueClass();
          scope.lrcList = parseLrc(newValue);
          initLrc(true);
        });

        audio.ontimeupdate = function() {
          checkUpdate(audio.currentTime);
        };

        audio.onseeked = function() {
          initLrc(true);
          checkUpdate(audio.currentTime);
        };

        function initLrc(noScroll) {
          scope.lrcIndex = -1;

          if(noScroll) {
            return;
          }

          if(scope.lrcList && scope.lrcList[0]) {
            scope.marginTop = {
              'margin-top': scope.lrcList[0].top + 'px'
            };
          }
        }

        function checkUpdate(time) {
          if(scope.lrcIndex + 1 >= scope.lrcList.length) {
            return;
          }

          var curLrc = scope.lrcList[scope.lrcIndex + 1];
          // console.log('time: ', time, curLrc);

          if(time >= curLrc.time) {
            scope.lrcIndex++;

            scope.marginTop = {
              'margin-top': curLrc.top + 'px'
            };
            return checkUpdate(time);
          }
        }

        function lrcLoad(last) {
          console.log('last: ~~~' + last);
          if(last) {
            setTop(scope.lrcList, prefixHeight);
          }
        }

        // 歌词解析
        function parseLrc(lrcStr) {
          if(!lrcStr) {
            return [];
          }

          let lrcLines = lrcStr.split('\n');
          let parsedLrcList = [];
          lrcLines.forEach(function(line) {
            let arr = line.split(']');
            if(!arr || !arr.length) {
              return;
            }
            let lineLrc = arr.splice(arr.length - 1)[0];
            if(!lineLrc) {
              return;
            }

            arr.forEach(function(timeStr) {
              let timeTemp = timeStr.match(/(\d+)\:(\d+)((\.|\:)(\d+))?/);
              if(!timeTemp) {
                return;
              }
              let time = (parseInt(timeTemp[1]) || 0) * 60 +
                (parseInt(timeTemp[2]) || 0) +
                (parseInt(timeTemp[4]) || 0) / 100;

              parsedLrcList.push({
                time: time,
                lineLrc: lineLrc,
              });
            });
          });

          if(!parsedLrcList || !parsedLrcList.length) {
            console.log('pares fail');
            return [];
          }

          // 添加开始和最后的空语句
          parsedLrcList.push.apply(parsedLrcList, [{
            time: 0,
            lineLrc: '',
          }, {
            time: (parsedLrcList[parsedLrcList.length - 1] || {}).time + 1,
            lineLrc: '',
          }]);

          // 按照时间排序歌词
          parsedLrcList.sort(function(a, b) {
            return a.time - b.time;
          });

          return parsedLrcList;
        }

        function setTop(lrcList, prefixHeight, lrcLineEleList) {
          // $timeout 防止元素计算高度错误
          $timeout(function() {
            lrcLineEleList = lrcLineEleList || element[0].querySelectorAll('.' + scope.lrcUniqueClass);
            if(lrcLineEleList.length !== lrcList.length) {
              console.warn('歌词长度不相等, 忽略设置高度', 'lrcLineEleList.length: ', lrcLineEleList.length, 'lrcList.length: ', lrcList.length);
              return;
            }

            var sum = 0;
            lrcList.map(function(item, index) {
              item.top = prefixHeight - sum;
              // 去除空语句
              if(item && item.lineLrc.replace(/\s/gi, '')) {
                sum += getEleOuterHeight(lrcLineEleList[index]);
              }
            });
            initLrc();
          }, 0);
        }

        function getEleOuterHeight(ele) {
          let style = ele.currentStyle || window.getComputedStyle(ele);
          let margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
          let padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          let border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

          return ele.offsetHeight + margin - padding + border;
        }

        function lrcUniqueClass(){
          let nu = 0;
          return function(){
            nu++;
            return 'lrcUniqueClass' + nu;
          };
        }
      }
    };
  });
