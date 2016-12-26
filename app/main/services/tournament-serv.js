'use strict';
angular.module('main')
.constant('baseURL', 'http://localhost:3000/api')

.service('tournamentService', function ($http, $q, $filter, baseURL) {

  var tournament = {};
  var tournaments = [];
  var myTournaments = [];

  this.tournamentList = function () {
    tournaments = $filter('orderBy')(tournaments, ['-date', 'name']);
    return tournaments;
  };

  this.getTournaments = function () {
    return $http.get(baseURL + '/tournaments')
    .then(
      function (response) {
        if (typeof response.data === 'object') {
          tournaments = $filter('orderBy')(response.data, ['-date', 'name']);
          return tournaments;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response);
      }
    );
  };

  this.myTournaments = function () {
    return myTournaments;
  }

  this.getTournament = function (tournamentId) {
    return $http.get(baseURL + '/tournaments/' + tournamentId)
    .then(
      function (response) {
        if (typeof response.data === 'object') {
          return response.data;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response);
      }
    );
  }

  var self = this;

  this.getMyTournaments = function (currentUser) {
    return $http.get(baseURL + '/tournaments/inscriptions/' + currentUser._id).then(
      function (response) {
        if (typeof response.data === 'object') {
          return response.data;
        } else {
          return $q.reject(response.data);
        }
        // myTournaments = [];
        // for (var i = 0; i < response.data.length; i++) {
        //   var aux = self.getTournament(response.data[i].tournament);
        //   self.getTournament(response.data[i].tournament).then(
        //     function (response) {
        //       myTournaments.push(response);
        //       console.log(myTournaments);
        //     },
        //     function (response) {
        //       return $q.reject(response);
        //     }
        //   )
        // }
        // console.log(myTournaments);
      },
      function (response) {
        $q.reject(response.data);
      }
    );
  };

  this.getMyEvents = function (currentUser) {
    return $http.get(baseURL + '/tournaments/owner/' + currentUser._id).then(
      function (response) {
        return response.data;
      },
      function (response) {
        $q.reject(response.data);
      }
    )
  }

  this.createTournament = function (tournament) {
    return $http.post(baseURL + '/tournaments', tournament)
    .then(
      function (response) {
        if (typeof response.data === 'object') {
          tournaments.push(response.data);
          return response.data;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response);
      }
    );
  };

  this.deleteTournament = function (tournament) {
    return $http.delete(baseURL + '/tournaments/' + tournament._id).then(
      function (response) {
        if (response.status === 200) {
          var index = tournaments.indexOf(tournament);
          tournaments.splice(index, 1);
          return response;
        }
      },
      function (response) {
        return $q.reject(response);
      }
    );
  };

  this.currentTournament = function () {
    return tournament;
  };

  this.setCurrentTournament = function (t) {
    tournament = t;
  };

  this.updateTournament = function (tournament) {
    return $http.put(baseURL + '/tournaments/' + tournament._id, tournament)
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
