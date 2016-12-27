'use strict';
angular.module('main')
.constant('baseURL', 'http://localhost:3000/api')

.service('listService', function ($http, $q, baseURL) {

  this.getListByInscription = function (inscriptionId) {
    return $http.get(baseURL + '/lists/' + inscriptionId).then(
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
    )
  }

  this.apiFormat = function (currentList) {
    var listAPI = [];
    for (var i = 0; i < currentList.length; i++) {
      var aux = { pilot: currentList[i].pilot._id, upgrades: []};
      for (var j = 0; j < currentList[i].upgrades.length; j++) {
        if (currentList[i].upgrades[j].selected._id !== undefined) {
          aux.upgrades.push({ upgrade: currentList[i].upgrades[j].selected._id });
        }
      }
      listAPI.push(aux);
    }
    return listAPI;
  };

  this.useInTournament = function (currentList, inscription) {
    var list = { inscription: inscription._id, ships: this.apiFormat(currentList) };
    return $http.get(baseURL + '/lists/' + list.inscription).then(
      function (response) {
        var previousList = response.data[0];
        if (previousList._id !== undefined) {
          return $http.put(baseURL + '/lists/' + previousList._id, list)
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
