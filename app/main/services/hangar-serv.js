'use strict';
angular.module('main')
    .constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
    //.constant('baseURL', 'http://localhost:3000/api')
.service('hangarService', function ($http, $q, $filter, baseURL) {

  var factions = [];
  var currentFaction = {};
  var pilots = [];
  var currentPilots = [];
  var currentPilot = {};
  var ships = [];
  var currentShip = {};


  this.setPilots = function () {
    return pilots;
  }

  this.factionList = function () {
    return factions;
  };

  this.shipList = function () {
    return ships;
  };

  this.pilotList = function () {
    return currentPilots;
  };

  this.currentShip = function () {
    return currentShip;
  };

  this.setCurrentShip = function (ship) {
    currentShip = ship;
    currentPilots = $filter('filter')(pilots, { 'ship': ship });
    currentPilot = {};
  };

  this.currentPilot = function () {
    return currentPilot;
  };

  this.setCurrentPilot = function (pilot) {
    currentPilot = pilot;
  };

  this.currentFaction = function () {
    return currentFaction;
  };

  this.setCurrentFaction = function (faction) {
    currentFaction = faction;
    // for (var i = 0; i < factions.length; i++) {
    //   if (factions[i]._id === factionId) {
    //     currentFaction = factions[i];
    //   }
    // }
  };

  this.getFactions = function () {
    return $http.get(baseURL + '/factions').then(
      function (response) {
        if (typeof response.data === 'object') {
          factions = response.data;
          return factions;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.getPilots = function () {
    return $http.get(baseURL + '/pilots').then(
      function (response) {
        if (typeof response.data === 'object') {
          pilots = response.data;
          return pilots;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.getShips = function () {
    return $http.get(baseURL + '/ships').then(
      function (response) {
        if (typeof response.data === 'object') {
          ships = response.data;
          return ships;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.createShip = function (ship) {
    return $http.post(baseURL + '/ships', ship).then(
      function (response) {
        if (typeof response.data === 'object') {
          currentShip = response.data;
          // ships.push(currentShip);
          return currentShip;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.updateShip = function (ship) {
    return $http.put(baseURL + '/ships/' + ship.keyname, ship).then(
      function (response) {
        if (typeof response.data === 'object') {
          currentShip = response.data;
          for (var i = 0; i < ships.length; i++) {
            if (ships[i]._id === currentShip._id) {
              ships[i] = currentShip;
            }
          }
          return currentShip;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.createPilot = function (pilot) {
    return $http.post(baseURL + '/pilots', pilot).then(
      function (response) {
        if (typeof response.data === 'object') {
          currentPilot = response.data;
          // pilots.push(currentPilot);
          return currentPilot;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.updatePilot = function (pilot) {
    return $http.put(baseURL + '/pilots/' + pilot._id, pilot).then(
      function (response) {
        if (typeof response.data === 'object') {
          currentPilot = response.data;
          for (var i = 0; i < currentPilots.length; i++) {
            if (currentPilots[i]._id === currentPilot._id) {
              currentPilots[i] = currentPilot;
            }
          }
          for (i = 0; i < pilots.length; i++) {
            if (pilots[i]._id === currentPilot._id) {
              pilots[i] = currentPilot;
            }
          }
          return currentPilot;
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
