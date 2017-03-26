'use strict';
angular.module('main')

.controller('ListCreatorCtrl', function ($scope, $filter, $ionicModal, $q, tournamentService, listService, hangarService, arsenalService, UserService) {

  $scope.showLoading();

  $scope.currentList = [];

  $scope.selectedFaction = undefined;
  $scope.selectedShip = '0';
  $scope.showShips = false;
  $scope.hideBody = [];

  $ionicModal.fromTemplateUrl('main/templates/listcreator/modal-select-upgrade.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $ionicModal.fromTemplateUrl('main/templates/listcreator/modal-select-tournament.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modalTournament = modal;
    $scope.hideLoading();
  });
  $scope.openModalTournament = function () {
    $scope.modalTournament.show();
  };
  $scope.closeModalTournament = function () {
    $scope.modalTournament.hide();
  }

  $scope.select = function (faction) {
    $scope.showLoading();
    if (faction === undefined) {
      $scope.showShips = false;
      $scope.selectedFaction = undefined;
      $scope.selectedShip = '0';
    } else if ($scope.selectedFaction !== faction) {
      $scope.showShips = true;
      $scope.selectedFaction = faction;
      $scope.selectedShip = '0';
    } else {
      $scope.showShips = !$scope.showShips;
    }
    $scope.hideLoading();
  };

  $scope.selectShip = function (ship) {
    if ($scope.selectedShip === ship.name) {
      $scope.selectedShip = '0';
    } else {
      $scope.selectedShip = ship.name;
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

  $scope.addToList = function (pilot) {
    $scope.showLoading();
    var cShip = $filter('filter')($scope.shipList, { name: pilot.ship })[0];
    var newConfig = { pilot: pilot, ship: cShip, upgrades: []};

    angular.forEach(pilot.slots, function (value, key) {
      newConfig.upgrades.push({ slot: key+value, type: value, selected: '' });
    });
    newConfig.upgrades.push({ slot: '0title', type: 'Title', selected: ''});
    newConfig.upgrades.push({ slot: '0modification', type: 'Modification', selected: ''});


    $scope.hideBody.push(true);
    $scope.currentList.push(newConfig);
    $scope.hideLoading();
  };

  $scope.clearList = function () {
    $scope.currentList = [];
  };

  $scope.duplicate = function (index) {
    // if(!$scope.currentList[index].pilot.unique) {
      var d = angular.copy($scope.currentList[index]);
      $scope.currentList.push(d);
    // }
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

  $scope.showSelectUpgrade = function (current, index, upgrade) {
    $scope.currentShip = current;
    $scope.upgradeIndex = index;
    $scope.currentUpgrade = upgrade;
    $scope.openModal();
  };

  $scope.selectUpgrade = function (upgrade) {
    $scope.currentShip.upgrades[$scope.upgradeIndex].selected = upgrade;
    $scope.closeModal();
  };

  $scope.dropUpgrade = function (current, upgradeIndex) {
    current.upgrades[upgradeIndex].selected = {};
  };

  $scope.useListIn = function (tournamentId) {
    $scope.closeModalTournament();
    $scope.showLoading();
    var inscription = $filter('filter')($scope.myInscriptionList, { tournament: tournamentId })[0];
    listService.useInTournament($scope.currentList, inscription).then(
      function () {
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error + ' ' + error.statusText;
      }
    );
  };

  $scope.availableUpgrade = function (upgrade) {
    return !($scope.currentUpgrade === undefined)
        && (
            upgrade.slot === $scope.currentUpgrade.type
            && (upgrade.ship === undefined || upgrade.ship.indexOf($scope.currentShip.ship.name) != -1)
            && (upgrade.faction === undefined || upgrade.faction.indexOf($scope.currentShip.pilot.faction) != -1)
        );
  }

})
;
