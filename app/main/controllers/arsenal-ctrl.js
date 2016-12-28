'use strict';
angular.module('main')

.controller('ArsenalCtrl', function ($scope, $ionicModal, $state, $filter, arsenalService) {

  $ionicModal.fromTemplateUrl('main/templates/modal-new-upgrade.html', {
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

  $scope.createUpgrade = function (upgrade) {
    $scope.closeModal();
    $scope.showLoading();
    arsenalService.createUpgrade(upgrade).then(
      function (response) {
        $scope.upgradeList.push(response);
        $scope.hideLoading();
        $scope.viewUpgrade(upgrade);
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.viewUpgrade = function (upgrade) {
    $scope.showLoading();
    arsenalService.setCurrentUpgrade(upgrade);
    $state.go('main.arsenalDetails');
  };

})

.controller('ArsenalDetailsCtrl', function ($scope, $ionicModal, arsenalService) {

  $scope.showLoading();

  $scope.upgrade = arsenalService.currentUpgrade();
  $scope.editUpgrade = angular.copy($scope.upgrade);

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-upgrade.html', {
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

  $scope.updateUpgrade = function (upgrade) {
    $scope.closeModal();
    $scope.showLoading();
    arsenalService.updateUpgrade(upgrade).then(
      function (response) {
        $scope.upgrade = response;
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

})

;
