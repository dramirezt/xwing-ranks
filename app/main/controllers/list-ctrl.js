'use strict';
angular.module('main')

.controller('ListCreatorCtrl', function ($scope, $filter, $ionicModal, $q, tournamentService, listService, hangarService, arsenalService, UserService) {

  $scope.showLoading();

  $scope.currentList = [];
  $scope.currentPoints = 0;
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

    $scope.showShip = function (ship) {
        var faction = ship.faction;
        if (faction.indexOf('First Order') !== -1) faction = 'Galactic Empire';
        else if (faction.indexOf('Resistance') !== -1) faction = 'Rebel Alliance';
        return faction.indexOf($scope.selectedFaction) !== -1;
    };

    $scope.showShip = function (pilot) {
        var faction = pilot.faction;
        if (faction.indexOf('First Order') !== -1) faction = 'Galactic Empire';
        else if (faction.indexOf('Resistance') !== -1) faction = 'Rebel Alliance';
        return faction.indexOf($scope.selectedFaction) !== -1;
    };

  $scope.select = function (faction) {
    $scope.showLoading();
    if (!faction) {
      $scope.showShips = false;
      $scope.selectedFaction = undefined;
      $scope.selectedShip = '0';
      $scope.currentList = [];
      $scope.currentPoints = 0;
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

  $scope.getInscriptionName = function (playerId) {
    return $filter('filter')($scope.inscriptionList, { _id: playerId })[0].name;
  };

  $scope.addToList = function (pilot) {
    $scope.showLoading();
    var uniqueFound = false;
    if (pilot.unique === true) {
        var i = 0;
        while (!uniqueFound && i < $scope.currentList.length) {
            uniqueFound = $scope.currentList[i].pilot.name === pilot.name;
            i++;
        }
    }
    if (!uniqueFound) {
        var cShip = angular.copy($filter('filter')($scope.shipList, {name: pilot.ship})[0]);
        var newConfig = {pilot: pilot, ship: cShip, upgrades: []};

        angular.forEach(pilot.slots, function (value, key) {
            newConfig.upgrades.push({slot: key + value, type: value, selected: ''});
        });
        newConfig.upgrades.push({slot: '0title', type: 'Title', selected: ''});
        newConfig.upgrades.push({slot: '0modification', type: 'Modification', selected: ''});


        $scope.hideBody.push(true);
        $scope.currentList.push(newConfig);
        $scope.currentPoints += pilot.points;
    }
    $scope.hideLoading();
  };

  $scope.clearList = function () {
    $scope.currentList = [];
  };

  $scope.duplicate = function (index) {
      if(!$scope.currentList[index].pilot.unique) {
          var d = angular.copy($scope.currentList[index]);
          $scope.currentList.push(d);
          $scope.currentPoints += $scope.currentList[index].pilot.points;
      }
  };

  $scope.dropFromList = function (index) {
      console.log($scope.currentList[index]);
      if($scope.currentList[index].upgrades){
          for (var i = 0; i < $scope.currentList[index].upgrades.length; i++) {
              if ($scope.currentList[index].upgrades[i].selected) {
                  $scope.currentPoints -= $scope.currentList[index].upgrades[i].selected.points;
              }
          }
      }
      $scope.currentPoints -= $scope.currentList[index].pilot.points;
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
      var found = false;
      if (upgrade.unique === true) {
          var i = 0;
          while (!found && i < $scope.currentList.length) {
              var j = 0;
              while (!found && j < $scope.currentList[i].upgrades.length) {
                  found = (upgrade.name === $scope.currentList[i].upgrades[j].selected.name);
                  j++;
              }
              i++;
          }
      }
      if (!found && upgrade.limited === true) {
          var i = 0;
          while (!found && i < $scope.currentShip.upgrades.length) {
              found = (upgrade.name === $scope.currentShip.upgrades[i].selected.name);
              i++;
          }
      }
      if (!found) {
          if (upgrade.grants) {
              for (var i = 0; i < upgrade.grants.length; i++) {
                  switch (upgrade.grants[i].type) {
                      case 'slot':
                          $scope.currentShip.upgrades.push({
                              selected: '', slot: i + upgrade.grants[i].name,
                              type: upgrade.grants[i].name
                          });
                          break;
                      case 'stats':
                          console.log($scope.currentShip);
                          switch (upgrade.grants[i].name) {
                              case 'attack':
                                  $scope.currentShip.ship.attack += upgrade.grants[i].value;
                                  break;
                              case 'agility':
                                  $scope.currentShip.ship.agility += upgrade.grants[i].value;
                                  break;
                              case 'hull':
                                  $scope.currentShip.ship.hull += upgrade.grants[i].value;
                                  break;
                              case 'shields':
                                  $scope.currentShip.ship.shields += upgrade.grants[i].value;
                                  break;
                              case 'skill':
                                  $scope.currentShip.pilot.skill += upgrade.grants[i].value;
                              default:
                                  break;
                          }
                          break;
                      case 'action':
                          $scope.currentShip.ship.actions.push(upgrade.grants[i].name);
                          break;
                      case '-slot':
                          break;
                      default:
                          break;
                  }
              }
          }
          $scope.currentShip.upgrades[$scope.upgradeIndex].selected = upgrade;
          $scope.currentPoints += upgrade.points;
      }
      $scope.closeModal();
  };

  $scope.dropUpgrade = function (current, upgradeIndex) {
      $scope.currentPoints -= current.upgrades[upgradeIndex].selected.points;
      current.upgrades[upgradeIndex].selected = {};
  };

  $scope.useListIn = function (tournamentId) {
    $scope.closeModalTournament();
    $scope.showLoading();
    var inscription = $filter('filter')($scope.myInscriptionList, { tournament: tournamentId })[0];
    listService.useInTournament($scope.currentList, inscription, true).then(
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
