'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
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

  this.getFactionUse = function (){
      return $http.get(baseURL + '/lists/count/rebel').then(
          function (response) {
              var data = [0, 0, 0, 0]
              data[1] = response.data;
              return $http.get(baseURL + '/lists/count/empire').then(
                  function (response) {
                      data[2] = response.data;
                      return $http.get(baseURL + '/lists/count/scum').then(
                          function (response) {
                              data[3] = response.data;
                              data[0] = data[1] + data[2] + data[3];
                              return data;
                          },
                          function (response) {
                              $q.reject(response);
                          }
                      );
                  },
                  function (response) {
                      $q.reject(response);
                  }
              );
          },
          function (response) {
              $q.reject(response);
          }
      );
  }

  this.getPilotUse = function () {
      return $http.get(baseURL + '/lists/stats/pilotuse').then(
          function (response) {
              return response.data;
          },
          function (error) {
              $q.reject(error);
          }
      )
  }

    // this.getRebelLists= function () {
    //     return $http.get(baseURL + '/lists/count/rebel').then(
    //         function (response) {
    //             return response.data;
    //         },
    //         function (response) {
    //             $q.reject(response);
    //         }
    //     )
    // }

});
