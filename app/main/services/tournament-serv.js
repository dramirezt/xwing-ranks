'use strict';
angular.module('main')
      .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
    // .constant('baseURL', 'http://localhost:3000/api')
.service('tournamentService', function ($http, $q, $filter, baseURL) {

  var tournament = {};
  var tournaments = [];
  var myTournaments = [];

    this.importTournament = function (data) {
        return $http.post(baseURL + '/tournaments/import', data).then(
            function (response) {
                return response.data;
            },
            function (response) {
                return $q.reject(response);
            }
        );
    };

  this.tournamentList = function () {
    tournaments = $filter('orderBy')(tournaments, ['-startDate', 'name']);
    return tournaments;
  };

  this.getFinishedTournamentNumber = function () {
      return $http.get(baseURL + '/tournaments/finished/count').then(
          function (response) {
              return response.data;
          },
          function (response) {
              $q.reject(response);
          }
      )
  };

  this.getFollowingTournamentNumber = function () {
      return $http.get(baseURL + '/tournaments/following/count').then(
          function (response) {
              return response.data;
          },
          function (response) {
              $q.reject(response);
          }
      )
  };

  this.getTournaments = function (start) {
    if (!start) start = 0;
    return $http.get(baseURL + '/tournaments/finished/' + start)
    .then(
      function (response) {
        if (typeof response.data === 'object') {
          tournaments = response.data;
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

    this.getFollowingTournaments = function (start) {
        if (!start) start = 0;
        return $http.get(baseURL + '/tournaments/following/' + start)
            .then(
                function (response) {
                    if (typeof response.data === 'object') {
                        tournaments = response.data;
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

  this.getMyTournaments = function (currentUser) {
    return $http.get(baseURL + '/tournaments/inscriptions/' + currentUser._id).then(
      function (response) {
        if (typeof response.data === 'object') {
          return response.data;
        } else {
          return $q.reject(response);
        }
      },
      function (response) {
        $q.reject(response);
      }
    );
  };

  this.getMyEvents = function (currentUser) {
    return $http.get(baseURL + '/tournaments/owner/' + currentUser._id).then(
      function (response) {
        return response;
      },
      function (response) {
        $q.reject(response);
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
