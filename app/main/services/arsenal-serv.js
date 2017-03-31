'use strict';
angular.module('main')
.constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')
//.constant('baseURL', 'http://localhost:3000/api')

.service('arsenalService', function (baseURL, $http, $q) {

  var upgrades = [];
  var currentUpgrade = {};

  this.upgradeList = function () {
    return upgrades;
  };

  this.currentUpgrade = function () {
    return currentUpgrade;
  };

  this.setCurrentUpgrade = function (upgrade) {
    currentUpgrade = upgrade;
  };

  this.getUpgrades = function () {
    return $http.get(baseURL + '/upgrades').then(
      function (response) {
        if (typeof response.data === 'object') {
          upgrades = response.data;
          return upgrades;
        } else {
          return $q.reject(response.data);
        }
      },
      function (response) {
        return $q.reject(response.data);
      }
    );
  };

  this.createUpgrade = function (upgrade) {
    return $http.post(baseURL + '/upgrades', upgrade).then(
      function (response) {
        if (typeof response.data === 'object') {
          // upgrades.push(response.data);
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

  this.updateUpgrade = function (upgrade) {
    return $http.put(baseURL + '/upgrades/' + upgrade._id, upgrade).then(
      function (response) {
        if (typeof response.data === 'object') {
          var index = upgrades.indexOf(upgrade);
          upgrades[index] = response.data;
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

  this.deleteUpgrade = function (upgrade) {
    return $http.delete(baseURL + '/upgrades/' + upgrade._id).then(
      function (response) {
        if (response.status === 200) {
          var index = upgrades.indexOf(upgrade);
          upgrades.splice(index, 1);
          return response;
        }
      },
      function (response) {
        return $q.reject(response);
      }
    );
  };

});
