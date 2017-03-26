'use strict';
angular.module('main')

.controller('UserProfileCtrl', function ($scope, UserService) {

  $scope.userProf = UserService.userProfile();
  $scope.showNoDataProfile = false;

  function readyPlots() {
    // if ($scope.userProf.games != 0) {

      $scope.wlratio = (50+parseInt($scope.userProf.victories))/(100+parseInt($scope.userProf.games))*100;

      if($scope.userProf.empireGames > $scope.userProf.rebelGames && $scope.userProf.empireGames > $scope.userProf.scumGames) {
        $scope.mostUsedFaction = 'empire';
      } else if ($scope.userProf.rebelGames > $scope.userProf.empireGames && $scope.userProf.rebelGames > $scope.userProf.scumGames) {
        $scope.mostUsedFaction = 'rebel';
      } else {
        $scope.mostUsedFaction = 'scum';
      }

      $scope.combatLabels = ["Victorias", "Derrotas"];
      $scope.combatData = [ $scope.wlratio, 100-$scope.wlratio ];
      $scope.options = {
        // scales: {
        //   yAxes: [
        //     {
        //       id: 'y-axis-1',
        //       type: 'linear',
        //       display: true,
        //       position: 'left',
        //       ticks: {
        //         beginAtZero: true
        //       }
        //     }
        //   ]
        // }
        legend: {
          display: true,
        }
      };

      $scope.factionLabels = ["Alianza Rebelde", "Escoria y Villanos", "Imperio Galáctico"];
      $scope.factionData = [33 + (parseInt($scope.userProf.rebelGames)/(parseInt($scope.userProf.games) +1))*100, 33 + (parseInt($scope.userProf.empireGames)/(parseInt($scope.userProf.games) +1))*100, 33 + (parseInt($scope.userProf.scumGames)/(parseInt($scope.userProf.games) +1))*100];
    // }
    // else {
    //   $scope.showNoDataProfile = true;
    // }
  }

  if (!$scope.userProf._id) {
    UserService.getCurrentUser().then(
      function (response) {
        $scope.userProf = response;
        readyPlots();
      },
      function (error) {
        $scope.error = 'Error: ' + error + ' ' + error.statusText;
      }
    );
  } else {
    readyPlots();
  }


  $scope.showStatistic = true;

  $scope.switchStatistic = function (value) {
    $scope.showStatistic = value;
  }

});
