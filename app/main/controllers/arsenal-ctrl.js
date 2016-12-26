'use strict';
angular.module('main')

.controller('ArsenalCtrl', function ($scope, $ionicModal, $state, $filter, arsenalService) {

  $scope.upgradeList = arsenalService.upgradeList();

  arsenalService.getUpgrades().then(
    function (response) {
      $scope.upgradeList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  $ionicModal.fromTemplateUrl('main/templates/modal-new-upgrade.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.createUpgrade = function (upgrade) {
    arsenalService.createUpgrade(upgrade).then(
      function (response) {
        $scope.upgradeList.push(response);
        $scope.modal.hide();
        $scope.viewUpgrade(upgrade);
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.viewUpgrade = function (upgrade) {
    arsenalService.setCurrentUpgrade(upgrade);
    $state.go('main.arsenalDetails');
  };

})

.controller('ArsenalDetailsCtrl', function ($scope, $ionicModal, arsenalService) {

  $scope.upgrade = arsenalService.currentUpgrade();
  $scope.editUpgrade = angular.copy($scope.upgrade);

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-upgrade.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.updateUpgrade = function (upgrade) {
    arsenalService.updateUpgrade(upgrade).then(
      function (response) {
        $scope.modal.hide();
        $scope.upgrade = response;
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

})

;
