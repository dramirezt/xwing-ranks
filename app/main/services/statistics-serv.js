'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com/:3000/api')
    //.constant('baseURL', 'http://localhost:3000/api')
.service('statisticsService', function ($http, $q, $filter, baseURL) {

  var attackProbability = [];
  var defenseProbability = [];

  this.getAttack = function (shipKeyname) {
    return $http.get(baseURL + '/ships/' + shipKeyname + '/statistics/attack').then(
      function (response) {
        if (typeof response.data === 'object') {
          attackProbability = response.data;
          return attackProbability;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  }

  this.getDefense = function (shipKeyname) {
    return $http.get(baseURL + '/ships/' + shipKeyname + '/statistics/agility').then(
      function (response) {
        if (typeof response.data === 'object') {
          defenseProbability = response.data;
          return defenseProbability;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  }

});
