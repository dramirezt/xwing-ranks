'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
    //.constant('baseURL', 'http://localhost:3000/api')
.service('inscriptionService', function ($http, $q, $filter, baseURL) {

  var inscriptions = [];
  var currentInscription = {};

  this.inscriptionList = function () {
    inscriptions = $filter('orderBy')(inscriptions, ['drop', 'bracketPosition', 'topPosition', 'swissPosition', '-victoryPoints', '-marginOfVictory']);
    return inscriptions;
  };

  this.getInscriptions = function (tournament) {
    return $http.get(baseURL + '/tournaments/' + tournament._id + '/inscriptions').then(
      function (response) {
        inscriptions = $filter('orderBy')(response.data, ['drop', 'bracketPosition', 'topPosition', 'swissPosition', '-victoryPoints', '-marginOfVictory']);
        return inscriptions;
      },
      function (response) {
        $q.reject(response.data);
      }
    );
  };

  this.createInscription = function (newInscription) {
    return $http.post(baseURL + '/tournaments/' + newInscription.tournament + '/inscriptions', newInscription)
      .then(
        function (response) {
          if (typeof response.data === 'object') {
            inscriptions.push(response.data);
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

  this.currentInscription = function () {
    return currentInscription;
  };

  this.setCurrentInscription = function (inscription) {
    currentInscription = inscription;
  };

  this.updateInscription = function (inscription) {
    return $http.put(baseURL + '/tournaments/' + inscription.tournament + '/inscriptions/' + inscription._id, inscription)
      .then(
        function (response) {
          if (typeof response.data === 'object') {
            inscriptions = $filter('orderBy')(inscriptions, ['drop', 'bracketPosition', 'topPosition', 'swissPosition', '-victoryPoints', '-marginOfVictory']);
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

  this.deteteInscription = function (inscription) {

    return $http.delete(baseURL + '/tournaments/' + inscription.tournament + '/inscriptions/' + inscription._id).then(
      function (response) {
        var index = inscriptions.indexOf(inscription);
        inscriptions.splice(index, 1);
        return response;
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.deleteInscriptions = function (tournament) {
    return $http.delete(baseURL + '/tournaments/' + tournament._id + '/inscriptions').then(
      function (response) {
        if (response.status === 200) {
          inscriptions = [];
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

})
;
