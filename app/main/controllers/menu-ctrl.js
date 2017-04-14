'use strict';
angular.module('main')
.controller('MenuCtrl', function ($scope, mongoDB, $filter, $ionicModal, $ionicPopup, $ionicPopover, $ionicLoading, $q,
                                  $state, arsenalService, hangarService, tournamentService, AuthService, UserService, statisticsService) {

  $scope.showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner>Loading...',
      duration: 3000
    }).then(function(){
      //  console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideLoading = function(){
    $ionicLoading.hide().then(function(){
      //  console.log("The loading indicator is now hidden");
    });
  };

  $scope.showLoading();

  $scope.factionList = [];
  $scope.shipList = [];
  $scope.currentShipList = [];
  $scope.pilotList = [];
  $scope.upgradeList = [];
  $scope.currentUpgradeList = [];
  $scope.upgradeListLength = 0;
  $scope.tournamentList = [];
  $scope.myInscriptions = [];
  $scope.myInscriptionList = [];
  $scope.myHistory = [];
  $scope.currentUser = undefined;
  $scope.pilotListLength = 0;
  $scope.shipListLength = 0;

  $scope.factionList = ["Rebel Alliance", "Galactic Empire", "Scum and Villainy"];

  // hangarService.getFactions().then(
  //   function (response) {
  //     $scope.factionList = response;
  //   },
  //   function (error) {
  //     $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
  //   }
  // );

  hangarService.getShips().then(
    function (response) {
      $scope.shipList = $filter('orderBy')(response, ['name']);
      $scope.shipListLength = $scope.shipList.length;
      var i = 0;
      while(i < 20 && i < $scope.shipList.length){
          $scope.currentShipList.push($scope.shipList[i]);
          i++;
      }
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  hangarService.getPilots().then(
    function (response) {
      $scope.pilotList = response;
      $scope.pilotListLength = $scope.pilotList.length;
      for (var i = 0; i < $scope.shipList.length; i++) {
        $scope.shipList[i].nPilots = $filter('filter')($scope.pilotList, { ship: $scope.shipList[i].name}).length;
      }
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  arsenalService.getUpgrades().then(
    function (response) {
      $scope.upgradeList = response;
      var i = 0;
      $scope.upgradeListLength = $scope.upgradeList.length;
      while(i < 20 && i < $scope.upgradeListLength){
        $scope.currentUpgradeList.push($scope.upgradeList[i]);
        i++;
      }
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

    $scope.factionLabels = ["Alianza Rebelde", "Imperio Galáctico", "Escoria y Villanos"];
    $scope.factionColors = ['#ffa2a2', '#adf1fe', '#b1ffb1'];
    $scope.factionOptions = { legend: { display: true } };

    statisticsService.getFactionUse().then(
        function (response) {
          $scope.totalLists = response[0];
          $scope.factionData = [
              Math.round(response[1]/response[0] * 100, 2),
              Math.round(response[2]/response[0] * 100, 2),
              Math.round(response[3]/response[0] * 100, 2)
          ];
        }
    );

    $scope.pilotsLabels = [];
    $scope.pilotsData = [];
    $scope.totalPilots = 0;

    statisticsService.getPilotUse().then(
        function (response) {
            for (var i = 0; i < response.length; i++) {
                $scope.pilotsLabels.push(response[i].source);
                $scope.pilotsData.push(response[i].Percent);
            }
            $scope.totalPilots = response[0].Total;
        }
    );

    $scope.shipsLabels = [];
    $scope.shipsData = [];
    $scope.totalShips = 0;

    statisticsService.getShipUse().then(
        function (response) {
            for (var i = 0; i < response.length; i++) {
                $scope.shipsLabels.push(response[i].source);
                $scope.shipsData.push(response[i].Percent);
                console.log(response[i].source + " " + response[i].Freq);
            }
            $scope.totalShips = response[0].Total;
        }
    );

    tournamentService.getLastWinner().then(
        function (response) {
            console.log(response);
        },
        function (error) {
            $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
    );

    $scope.shipOptions = {scales: {
        xAxes: [{
            display: true,
            ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                beginAtZero: true   // minimum value will be 0.
            }
        }]}};

  function getUserData () {
    UserService.getCurrentUser().then(
      function (response) {
        $scope.currentUser = response;
        tournamentService.getMyTournaments($scope.currentUser).then(
          function (response) {
            $scope.myInscriptionList = response;
            var promises = [];
            for (var i = 0; i < response.length; i++) {
              promises.push(tournamentService.getTournament(response[i].tournament));
            }
            $q.all(promises).then(
              function (response) {
                for (var j = 0; j < response.length; j++) {
                  $scope.updateMyInscriptionList(response[j]);
                }
                $scope.hideLoading();
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
  }

  getUserData();

  $scope.updateMyInscriptions = function (inscription) {
    $scope.myInscriptionList.push(inscription);
  };

  $scope.updateMyInscriptionList = function (tournament) {
    var currentDate = new Date();
    var aux = new Date(tournament.date);
    if (aux >= currentDate) {
      $scope.myInscriptions.push(tournament);
    } else {
      $scope.myHistory.push(tournament);
    }
  };

  mongoDB.query(
      function (response) {
        // returns api version string
        $scope.message = response.message;
      },
      function (response) {
        $scope.message = 'Error: ' + response.status + ' ' + response.statusText;
      }
  );

  $ionicModal.fromTemplateUrl('main/templates/users/modal-login.html', {
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

  $scope.viewProfile = function (userId) {
    UserService.getProfile(userId).then(
      function () {
        $state.go('main.userProfile');
      },
      function (error) {
        $scope.error = 'Error: ' + error + ' ' + error.statusText;
      }
    );
  };

  $scope.login = function (user) {
    $scope.closeModal();
    $scope.showLoading();
    AuthService.login(user).then(
      function (response) {
        getUserData();
        $scope.hideLoading();
      },
      function (error) {
        $ionicPopup.alert({
          title: 'Login failed!',
          template: error
        });
      }
    );
  };

  $scope.logout = function () {
    $scope.showLoading();
    AuthService.logout();
    $scope.currentUser = undefined;
    $scope.hideLoading();
  };

  $scope.test = function (object){
      console.log(object);
  };
});