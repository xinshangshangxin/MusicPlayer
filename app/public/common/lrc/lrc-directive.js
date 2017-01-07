'use strict';

angular
  .module('musicPlayer')
  .directive('lrc', function($timeout, $window) {
    return {
      restrict: 'AE',
      scope: {
        lrcStr: '=lrcStr',
        mediaElement: '=mediaElement',
        timeFix: '=timeFix',
      },
      templateUrl: 'common/lrc/lrc.tpl.html',
      link: function(scope, element) {
        var audio = scope.mediaElement[0];
        var prefixHeight = 100;
        var generateLrcUniqueClass = lrcUniqueClass();
        // 因为lrc上有动画, 直接通过元素P 会获取上一次歌词的残留,故对每个歌词使用独立的class
        scope.lrcUniqueClass = generateLrcUniqueClass();

        scope.lrcIndex = 0;
        scope.timeFix = scope.timeFix || 0;
        scope.marginTop = {
          'margin-top': prefixHeight + 'px'
        };
        scope.load = lrcLoad;

        angular.element($window).bind('resize', function() {
          console.log('window resize, lrc recalculate!!');
          calculateTop(0);
          calculateTop(550);
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

        function calculateTop(timeout) {
          $timeout(function () {
            prefixHeight = visibleArea(element[0].querySelector('div')).height / 3;
            console.log('prefixHeight: ', prefixHeight);
            setTop(scope.lrcList, prefixHeight);
          }, timeout);
        }

        function initLrc(noScroll) {
          scope.lrcIndex = -1;

          if(noScroll) {
            checkUpdate(audio.currentTime);
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

          if((time + scope.timeFix / 100) >= curLrc.time) {
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

          var lrcLines = lrcStr.split('\n');
          var parsedLrcList = [];
          lrcLines.forEach(function(line) {
            var arr = line.split(']');
            if(!arr || !arr.length) {
              return;
            }
            var lineLrc = arr.splice(arr.length - 1)[0];
            if(!lineLrc) {
              return;
            }

            arr.forEach(function(timeStr) {
              var timeTemp = timeStr.match(/(\d+)\:(\d+)((\.|\:)(\d+))?/);
              if(!timeTemp) {
                return;
              }
              var time = (parseInt(timeTemp[1]) || 0) * 60 +
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
            time: (parsedLrcList[parsedLrcList.length - 1] || {}).time + 30,
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
            lrcList.forEach(function(item, index) {
              item.top = prefixHeight - sum;
              // 去除空语句
              if(item && item.lineLrc.replace(/\s/gi, '')) {
                sum += getEleOuterHeight(lrcLineEleList[index]);
              }
            });
            initLrc(true);
          }, 0);
        }

        function getEleOuterHeight(ele) {
          var style = ele.currentStyle || window.getComputedStyle(ele);
          var margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
          var padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          var border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

          return ele.offsetHeight + margin - padding + border;
        }

        // http://stackoverflow.com/questions/12868287/get-height-of-visible-portion-of-div
        function visibleArea(node){
          var o = {height: node.offsetHeight, width: node.offsetWidth}, // size
            d = {y: (node.offsetTop || 0), x: (node.offsetLeft || 0), node: node.offsetParent}, // position
            css, y, x;
          while( null !== (node = node.parentNode) ){  // loop up through DOM
            css = window.getComputedStyle(node);
            if( css && css.overflow === 'hidden' ){  // if has style && overflow
              y = node.offsetHeight - d.y;         // calculate visible y
              x = node.offsetWidth - d.x;          // and x
              if( node !== d.node ){
                y = y + (node.offsetTop || 0);   // using || 0 in case it doesn't have an offsetParent
                x = x + (node.offsetLeft || 0);
              }
              if( y < o.height ) {
                if( y < 0 ) {
                  o.height = 0;
                }
                else {
                  o.height = y;
                }
              }
              if( x < o.width ) {
                if( x < 0 ) {
                  o.width = 0;
                }
                else {
                  o.width = x;
                }
              }
              return o;                            // return (modify if you want to loop up again)
            }
            if( node === d.node ){                   // update offsets
              d.y = d.y + (node.offsetTop || 0);
              d.x = d.x + (node.offsetLeft || 0);
              d.node = node.offsetParent;
            }
          }
          return o;                                    // return if no hidden
        }

        function lrcUniqueClass() {
          var nu = 0;
          return function() {
            nu++;
            return 'lrcUniqueClass' + nu;
          };
        }
      }
    };
  });
