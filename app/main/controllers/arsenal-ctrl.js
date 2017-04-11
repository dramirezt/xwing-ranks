'use strict';
angular.module('main')

.controller('ArsenalCtrl', function ($scope, $ionicModal, $state, $filter, arsenalService, $rootScope) {

  $scope.start = 20;
  $scope.upgrades = [];

  $scope.loadMore = function (start) {
      $scope.showLoading();
      var tmpShipList = $filter('filter')($scope.upgradeList, { 'slot': $scope.filterType,  'faction': $scope.filterFaction });
      $scope.upgradeListLength = $filter('filter')($scope.upgradeList, { 'slot': $scope.filterType,  'faction': $scope.filterFaction }).length;
      var i = start;
      while(i < start+20 && i < tmpShipList.length){
          $scope.currentUpgradeList.push(tmpShipList[i]);
          i++;
      }
      $scope.start +=20;
      $scope.hideLoading();
      $scope.$broadcast('scroll.infiniteScrollComplete');
  };


  // $scope.showMore = function (number) {
  //   var limit = $scope.display + number;
  //   if($scope.filterType || $scope.filterFaction) {
  //       var tmp = $filter('filter')($scope.upgradeList, { 'slot': $scope.filterType,  'faction': $scope.filterFaction });
  //       while ($scope.display < limit) {
  //         if(tmp[$scope.display]) $scope.currentUpgradeList.push(tmp[$scope.display]);
  //         $scope.display++;
  //       }
  //   } else {
  //       while ($scope.display < limit) {
  //           $scope.currentUpgradeList.push($scope.upgradeList[$scope.display]);
  //           $scope.display++;
  //       }
  //   }
  // };

  // arsenalService.getUpgrades().then(
  //     function (response) {
  //       $scope.upgradeList = response;
  //       $scope.showMore(10);
  //     },
  //     function (error) {
  //       $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
  //     }
  // );

  $ionicModal.fromTemplateUrl('main/templates/arsenal/modal-filters.html', {
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

    $scope.exportUpgrades = function () {
        for (var i = 0; i < $scope.upgradeList.length; i++ ){
            $scope.createUpgrade($scope.upgradeList[i]);
        }
    }

  $scope.showUpgrades = [];
  for (var i = 0; i < $scope.upgradeList.length; i++) {
    $scope.showUpgrades.push(false);
  }
  $scope.showUpgrade = function (index) {
      $scope.showUpgrades[index] = !$scope.showUpgrades[index];
  };

  $scope.filterType = undefined;
  $scope.filterByUpgradeType = function (type) {
    $scope.closeModal();
    $scope.start = 0;
    $scope.currentUpgradeList = [];
    if ($scope.filterType === type) {
      $scope.filterType = undefined;
    } else {
      $scope.filterType = type;
    }
    $scope.loadMore(0);
  };

  $scope.filterFaction = undefined;
  $scope.filterByFaction= function (factionName) {
    $scope.closeModal();
    $scope.start = 0;
    $scope.currentUpgradeList = [];
    if ($scope.filterFaction === factionName) {
      $scope.filterFaction = undefined;
    } else {
      $scope.filterFaction = factionName;
    }
    $scope.loadMore(0);
  };

  $scope.createUpgrade = function (upgrade) {
    $scope.closeModal();
    $scope.showLoading();
    arsenalService.createUpgrade(upgrade).then(
      function (response) {
        // $scope.upgradeList.push(response);
        $scope.hideLoading();
        // $scope.viewUpgrade(upgrade);
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

  $ionicModal.fromTemplateUrl('main/templates/arsenal/modal-edit-upgrade.html', {
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
