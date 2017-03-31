'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
    //.constant('baseURL', 'http://localhost:3000/api')
.service('pairingService', function ($http, $q, $filter, baseURL) {

  var pairing = {};
  var pairings = [];
  var pairingsTop = [];

  this.pairingList = function () {
    pairings = $filter('orderBy')(pairings, ['round', 'isBye', 'table']);
    return pairings;
  };

  this.pairingTopList = function () {
    pairingsTop = $filter('orderBy')(pairingsTop, ['round', 'table']);
    return pairingsTop;
  };

  this.getPairings = function (tournament) {
    return $http.get(baseURL + '/tournaments/' + tournament._id + '/pairings')
    .then(
      function (response) {
        if (typeof response.data === 'object') {
          pairings = [];
          pairingsTop = [];
          var aux = $filter('orderBy')(response.data, ['round', 'table']);
          for (var i = 0; i < aux.length; i++) {
            if (aux[i].round <= tournament.rounds) {
              pairings.push(aux[i]);
            } else {
              pairingsTop.push(aux[i]);
            }
          }
          return pairings;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.createPairing = function (pairing) {
    return $http.post(baseURL + '/tournaments/' + pairing.tournament + '/pairings', pairing).then(
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

  this.deletePairing = function (pairing) {
    return $http.delete(baseURL + '/tournaments/' + pairing.tournament + '/pairings/' + pairing._id).then(
      function (response) {
        var index = pairings.indexOf(pairing);
        pairings.splice(index, 1);
        return response;
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.deletePairings = function (tournament) {
    return $http.delete(baseURL + '/tournaments/' + tournament._id + '/pairings');
  };

  this.currentPairing = function () {
    return pairing;
  };

  this.setCurrentPairing = function (p) {
    pairing = p;
  };

  this.updatePairing = function (pairing) {
    return $http.put(baseURL + '/tournaments/' + pairing.tournament + '/pairings/' + pairing._id, pairing)
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
})
;
