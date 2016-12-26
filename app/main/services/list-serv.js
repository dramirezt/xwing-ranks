'use strict';
angular.module('main')
.constant('baseURL', 'http://localhost:3000/api')

.service('listService', function ($http, $q, baseURL) {

  this.apiFormat = function (currentList) {
    var listAPI = [];
    var aux = {};
    for (var i = 0; i < currentList.length; i++) {
      aux.pilot = currentList[i].pilot._id;
      aux.upgrades = [];
      for (var j = 0; j < currentList[i].upgrades.length; j++) {
        if (currentList[i].upgrades[j]._id !== undefined) {
          aux.upgrades.push(currentList[i].upgrades[j]._id);
        }
      }
      listAPI.push(aux);
    }
    return listAPI;
  };

  this.useInTournament = function (currentList, inscription) {
    var list = { inscription: inscription._id, ships: this.apiFormat(currentList) };
    $http.get(baseURL + '/lists/' + list.inscription._id)
      .then(
        function (response) {
          if (typeof response.data === 'object') {
            return $http.put(baseURL + '/lists/' + response.data._id, list)
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
          }
          else {
            return $http.post(baseURL + '/lists/', list)
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
          }
        },
        function (response) {
          return $q.reject(response.data);
        }
      );
  };

})
;
