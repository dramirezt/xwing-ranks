'use strict';
angular.module('main')
.constant('baseURL', 'http://localhost:3000/api')

.factory('mongoDB', ['$resource', 'baseURL', function ($resource, baseURL) {
  return $resource(baseURL + '/', null, {'query': { 'method': 'GET', isArray: false }});
}])

.service('UserService', function ($http, $q, baseURL) {

  var currentUser = {};

  this.currentUser = function () {
    return currentUser;
  };

  this.createUser = function (user) {
    return $http.post(baseURL + '/users', user)
      .then(
        function (response) {
          if (typeof response.data === 'object') {
            return response.data;
          } else {
            return $q.reject(response.data);
          }
        },
        function (response) {
          return $q.reject(response.data);
        }
      );
  };

  this.getCurrentUser = function () {
    return $http.get(baseURL + '/users/current')
      .then(
        function (response) {
          if (typeof response.data === 'object') {
            currentUser = response.data;
            return response.data;
          } else {
            return $q.reject(response.data);
          }
        },
        function (response) {
          return $q.reject(response.data);
        }
      );
  };

  this.getUsername = function (userId) {
    return $http.get(baseURL + '/users/' + userId).then(
      function (response) {
        return response.data.username;
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };
})

.service('AuthService', function ($q, $http, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;

  function loadUserCredentials () {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials (token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials (token) {
    isAuthenticated = true;
    authToken = token;
    // Set the token as header for your requests!
    $http.defaults.headers.common.Authorization = authToken;
  }

  function destroyUserCredentials () {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var register = function (user) {
    return $q(function (resolve, reject) {
      $http.post(API_ENDPOINT.url + '/signup', user).then(function (result) {
        if (result.data.success) {
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };

  var login = function (user) {
    return $q(function (resolve, reject) {
      $http.post(API_ENDPOINT.url + '/authenticate', user).then(function (result) {
        if (result.data.success) {
          storeUserCredentials(result.data.token);
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };

  var logout = function () {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    register: register,
    logout: logout,
    isAuthenticated: function () {return isAuthenticated;},
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})

.service('Main', function ($log, $timeout) {

  $log.log('Hello from your Service: Main in module main');

  // some initial data
  this.someData = {
    binding: 'Yes! Got that databinding working'
  };

  this.changeBriefly = function () {
    var initialValue = this.someData.binding;
    this.someData.binding = 'Yeah this was changed';

    var that = this;
    $timeout(function () {
      that.someData.binding = initialValue;
    }, 500);
  };

})
;
