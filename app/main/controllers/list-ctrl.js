'use strict';
angular.module('main')

.controller('ListCreatorCtrl', function ($scope, $filter, $ionicModal, $q, tournamentService, listService, hangarService, arsenalService, UserService) {

  $scope.currentList = [];

  hangarService.getFactions().then(
    function (response) {
      $scope.factionList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );
  hangarService.getShips().then(
    function (response) {
      $scope.shipList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );
  hangarService.getPilots().then(
    function (response) {
      $scope.pilotList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );
  arsenalService.getUpgrades().then(
    function (response) {
      $scope.upgradeList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  tournamentService.getTournaments()
  .then(
    function (response) {
      $scope.tournamentList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );
  
  $scope.myInscriptions = [];
  $scope.myHistory = [];

  UserService.getCurrentUser().then(
    function (response) {
      tournamentService.getMyTournaments(response).then(
        function (response) {
          var promises = [];
          for (var i = 0; i < response.length; i++) {
            promises.push(tournamentService.getTournament(response[i].tournament));
          }
          $q.all(promises).then(
            function (response) {
              var currentDate = new Date();
              var aux = {};
              for (var j = 0; j < response.length; j++) {
                aux = new Date(response[j].date);
                if (aux >= currentDate) {
                  $scope.myInscriptions.push(response[j]);
                } else {
                  $scope.myHistory.push(response[j]);
                }
              }
            },
            function (error) {
              $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
            }
          )
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  $scope.selectedFaction = '';
  $scope.showShips = false;
  $scope.select = function (faction) {
    if (faction === undefined) {
      $scope.showShips = false;
      $scope.selectedFaction = '';
      $scope.selectedShip = '0';
    } else if ($scope.selectedFaction !== faction) {
      $scope.showShips = true;
      $scope.selectedFaction = faction;
      $scope.selectedShip = '0';
    } else {
      $scope.showShips = !$scope.showShips;
    }
  };

  $scope.selectedShip = '0';
  $scope.selectShip = function (ship) {
    if ($scope.selectedShip === ship._id) {
      $scope.selectedShip = '0';
    } else {
      $scope.selectedShip = ship._id;
    }
  };

  $scope.showShip = function (ship) {
    if ($scope.selectedShip === '0') {
      return true;
    } else {
      if ($scope.selectedShip === ship._id) {
        return true;
      } else {
        return false;
      }
    }
  };

  $scope.getInscriptionName = function (playerId) {
    return $filter('filter')($scope.inscriptionList, { _id: playerId })[0].name;
  };

  $scope.hideBody = [];

  $scope.addToList = function (pilot) {
    var cShip = $filter('filter')($scope.shipList, { _id: pilot.ship })[0];
    var newConfig = { pilot: pilot, ship: cShip, upgrades: []};

    for (var i = 1; i <= pilot.elitePilot; i++) {
      newConfig.upgrades.push({ slot: 'elite' + i, type: 'elite', selected: '' });
    }
    angular.forEach(cShip.upgradeSlots, function (value, key) {
      for (var i = 1; i <= value; i++) {
        newConfig.upgrades.push({ slot: key + value, type: key, selected: '' });
      }
    });
    $scope.hideBody.push(true);
    $scope.currentList.push(newConfig);
  };

  $scope.clearList = function () {
    $scope.currentList = [];
  };

  $scope.duplicate = function (index) {
    var d = angular.copy($scope.currentList[index]);
    $scope.currentList.push(d);
  };

  $scope.dropFromList = function (index) {
    $scope.currentList.splice(index, 1);
  };

  $scope.toggle = function (index) {
    $scope.hideBody[index] = !$scope.hideBody[index];
  };

  $scope.visible = function (index) {
    return $scope.hideBody[index];
  };

  $ionicModal.fromTemplateUrl('main/templates/modal-select-upgrade.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('main/templates/modal-select-tournament.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modalTournament = modal;
  });

  $scope.showSelectUpgrade = function (current, index, upgrade) {
    $scope.currentShip = current;
    $scope.upgradeIndex = index;
    $scope.currentUpgrade = upgrade;
    $scope.modal.show();
  };

  $scope.selectUpgrade = function (upgrade) {
    $scope.currentShip.upgrades[$scope.upgradeIndex].selected = upgrade;
    $scope.modal.hide();
  };

  $scope.dropUpgrade = function (current, upgradeIndex) {
    current.upgrades[upgradeIndex].selected = {};
  };

  $scope.saveList = function () {
    $scope.modalTournament.show();
  };

  $scope.useInTournament = function () {
    listService.useInTournament($scope.currentList);
  };

  $scope.closeModal = function () {
    $scope.modalTournament.hide();
  };

  $scope.selectTournament = function () {
    // SELECCIONAR TORNEO PARA DEVOLVER ID DE INSCRIPCIÓN, SI NO HAY, INSCRIBIR AL JUGADOR Y DEVOLVER EL ID
  };

  $scope.getTimes = function (n) {
    if (!n) {
      return [];
    }
    else {
      return new Array(n);
    }
  };

})
;
