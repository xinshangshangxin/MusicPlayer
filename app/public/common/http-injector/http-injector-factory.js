'use strict';


angular
  .module('common')
  .factory('httpInjectorFactory', function($injector, $q, localSaveService, notificationService) {
    var serverUrl = '';
    var httpInjector = {
      setServerUrl: function(url) {
        serverUrl = url;
      },
      statusCodeRouter: null,
      request: function(config) {
        if(/^\/api\/v\d+\//.test(config.url)) {
          config.url = serverUrl + config.url;
        }
        config.headers = config.headers || {};
        if (localSaveService.get('token')) {
          config.headers.Authorization = 'Bearer ' + localSaveService.get('token');
        }
        return config;
      },
      responseError: function(response) {
        if(response.status === 401 || response.status === 403) {
          notificationService.error('无权限');
        }
        else if(response.status === 400) {
          response.isShow = true;
          notificationService.error(response.data.msg);
        }
        else if(response.status === 404) {
          notificationService.error('404错误');
        }
        else if(response.status >= 500) {
          notificationService.error('服务器出错');
        }

        if(httpInjector.statusCodeRouter && httpInjector.statusCodeRouter[response.status]) {
          $injector.get('$state').go(httpInjector.statusCodeRouter[response.status], {from: encodeURIComponent(location.href)});
        }
        return $q.reject(response);
      }
    };

    return httpInjector;
  });