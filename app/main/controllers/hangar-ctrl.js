'use strict';
angular.module('main')

.controller('HangarCtrl', function ($scope, $ionicModal, $state, $filter, $ionicLoading, hangarService) {

  $scope.showLoading();

  $scope.selectedFaction = '';

  $scope.newShip = {
    name: '',
    faction: '',
    keyname: '',
    attack: 2,
    agility: 2,
    hull: 2,
    shield: 2
  };
  $scope.newShip.actionBar = {
    focus: true,
    evade: false,
    barrelRoll: false,
    cloak: false,
    slam: false,
    targetLock: false,
    boost: false
  };
  $scope.newShip.upgradeSlots = {
    astromech: 0,
    bombs: 0,
    cannons: 0,
    crew: 0,
    illicit: 0,
    missiles: 0,
    modification: 1,
    salvagedAstromech: 0,
    systems: 0,
    techology: 0,
    title: 0,
    torpedoes: 0,
    turrets: 0
  };

  $ionicModal.fromTemplateUrl('main/templates/modal-new-ship.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
    $scope.hideLoading();
  });
  $scope.openModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  function getShipListLength () {
    if ($scope.selectedFaction !== '') {
      var c = 0;
      for (var i = 0; i < $scope.shipList.length; i++) {
        if ($scope.shipList[i].faction === $scope.selectedFaction) {
          c++;
        }
      }
      $scope.shipListLength = c;
    } else {
      $scope.shipListLength = $scope.shipList.length;
    }
  };

  function getPilotListLength () {
    if ($scope.selectedFaction !== '') {
      var c = 0;
      for (var i = 0; i < $scope.pilotList.length; i++) {
        if ($scope.pilotList[i].faction === $scope.selectedFaction) {
          c++;
        }
      }
      $scope.pilotListLength = c;
    } else {
      $scope.pilotListLength = $scope.pilotList.length;
    }
  };

  $scope.select = function (faction) {
    if ($scope.selectedFaction === faction._id) {
      $scope.selectedFaction = '';
    } else {
      $scope.selectedFaction = faction._id;
    }
    getShipListLength();
    getPilotListLength();
  };

  $scope.getFactionKeyname = function (factionId) {
    var name = '';
    var i = 0;
    while (i < $scope.factionList.length && name === '') {
      if ($scope.factionList[i]._id === factionId) {
        name = $scope.factionList[i].keyname;
      }
      i++;
    }
    return name;
  };

  $scope.createShip = function (newShip) {
    $scope.closeModal();
    $scope.showLoading();
    hangarService.createShip(newShip).then(
      function (response) {
        $scope.shipList.push(response);
        $scope.newShip = { name: '', faction: '', keyname: '', attack: 2, agility: 2, hull: 2, shield: 2 };
        $scope.newShip.actionBar = { focus: true, evade: false, barrelRoll: false, cloak: false, slam: false, targetLock: false };
        $scope.viewShip(response);
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.statusText + ' ' + error.statusText;
      }
    );
  };

  $scope.viewShip = function (ship) {
    $scope.showLoading();
    hangarService.setCurrentShip(ship);
    hangarService.setCurrentFaction(ship.faction);
    $state.go('main.hangarShip');
  };

})

.controller('ShipDetailsCtrl', function ($scope, $ionicModal, $state, $stateParams, $filter, hangarService) {

  $scope.showLoading();

  $scope.currentFaction = hangarService.currentFaction();
  $scope.ship = hangarService.currentShip();
  $scope.selected = 1;
  $scope.pilotList = $filter('filter')(hangarService.pilotList(), { ship: $scope.ship._id });

  $scope.editShip = angular.copy($scope.ship);
  $scope.newPilot = {
    name: '',
    pilotSkill: 1,
    unique: false,
    elitePilot: 0,
    ability: '',
    points: 12,
    faction: $scope.ship.faction,
    ship: $scope.ship._id
  };

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-ship.html', {
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

  $ionicModal.fromTemplateUrl('main/templates/modal-new-pilot.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modalNewPilot = modal;
    $scope.hideLoading();
  });
  $scope.showNewPilotModal = function () {
    $scope.modalNewPilot.show();
  };
  $scope.closeNewPilotModal = function () {
    $scope.modalNewPilot.hide();
  }

  $scope.updateShip = function (ship) {
    $scope.closeModal();
    $scope.showLoading();
    hangarService.updateShip(ship).then(
      function (response) {
        $scope.ship = response;
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.createPilot = function (pilot) {
    $scope.closeNewPilotModal();
    $scope.showLoading();
    hangarService.createPilot(pilot).then(
      function (response) {
        $scope.pilotList.push(response);
        $scope.newPilot = { name: '', pilotSkill: 1, unique: false, elitePilot: 0, ability: '', points: 12 };
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.viewPilot = function (pilot) {
    hangarService.setCurrentPilot(pilot);
    $state.go('main.hangarPilot');
  };

  $scope.getTimes = function (n) {
    if (!n) {
      return [];
    }
    else {
      return new Array(n);
    }
  };

  $scope.isSelected = function (n) {
    return $scope.selected === n;
  };

  $scope.select = function (n) {
    $scope.selected = n;
  };

})

.controller('ShipPilotCtrl', function ($scope, $ionicModal, hangarService) {

  $scope.showLoading();

  $scope.currentFaction = hangarService.currentFaction();
  $scope.ship = hangarService.currentShip();
  $scope.currentPilot = hangarService.currentPilot();
  $scope.editPilot = angular.copy($scope.currentPilot);

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-pilot.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
    $scope.hideLoading();
  });
  $scope.openModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $scope.updatePilot = function (pilot) {
    $scope.modal.hide();
    $scope.showLoading();
    hangarService.updatePilot(pilot).then(
      function (response) {
        $scope.currentPilot = response;
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

})
;
