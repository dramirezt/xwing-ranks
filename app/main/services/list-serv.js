'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
    //.constant('baseURL', 'http://localhost:3000/api')
.service('listService', function ($http, $q, baseURL) {

    this.getLists = function () {
        return $http.get(baseURL + '/lists').then(
            function (response) {
                if (typeof response.data === 'object') {
                    return response.data;
                } else {
                    return $q.reject(response);
                }
            },
            function (response) {
                return $q.reject(response);
            }
        );
    };

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
      var aux = { pilot: currentList[i].pilot.name, upgrades: []};
      for (var j = 0; j < currentList[i].upgrades.length; j++) {
        if (currentList[i].upgrades[j].selected.name !== undefined) {
          aux.upgrades.push({ upgrade: currentList[i].upgrades[j].selected.name });
        }
      }
      listAPI.push(aux);
    }
    return listAPI;
  };

  this.useInTournament = function (currentList, inscription, transform, faction) {
      if(transform) {
          currentList = this.apiFormat(currentList);
      }
    var list = { inscription: inscription._id, ships: currentList, faction: faction };
    return $http.get(baseURL + '/lists/' + list.inscription).then(
      function (response) {
        var previousList = response.data[0];
        if (previousList !== undefined) {
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

  this.updateList = function (list) {
      return $http.put(baseURL + '/lists/' + list._id, list)
          .then(
              function (response) {
                  if (typeof response.data === 'object') {
                      return response.data;
                  } else {
                      return $q.reject(response);
                  }
              },
              function (response) {
                  return $q.reject(response);
              }
          )
  }

})
;
