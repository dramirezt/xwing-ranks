'use strict';
angular.module('main')
.controller('MenuCtrl', function ($scope, mongoDB, $filter, $ionicModal, $ionicPopup, $ionicPopover, $ionicLoading, $q,
                                  $state, arsenalService, hangarService, tournamentService, AuthService, UserService, listService, $http) {

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
  $scope.pilotList = [];
  $scope.upgradeList = [];
  $scope.tournamentList = [];
  $scope.myInscriptions = [];
  $scope.myInscriptionList = [];
  $scope.myHistory = [];
  $scope.currentUser = undefined;

  $scope.factionList = ["Rebel Alliance", "Galactic Empire", "Scum And Villainy"];

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
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );
    // $http.get('../bower_components/xwing-data/data/ships.js')
    //     .success(
    //         function(response) {
    //             $scope.shipList = $filter('orderBy')(response, ['name']);
    //             $scope.shipListLength = $scope.shipList.length;
    //         },
    //         function (error) {
    //             $scope.error = error;
    //         }
    //     );

  // function orderPilots () {
  //   for (var i = 0; i < $scope.shipList.length; i++) {
  //     $scope.shipList[i].nPilots = $filter('filter')($scope.pilotList, { ship: $scope.shipList[i].name}).length;
  //   }
  // }

    // $http.get('../bower_components/xwing-data/data/pilots.js')
    //     .success(
    //         function(response) {
    //             $scope.pilotList = $filter('orderBy')(response, ['-points', 'skill', 'name']);
    //             $scope.pilotListLength = $scope.pilotList.length;
    //             for (var i = 0; i < $scope.shipList.length; i++) {
    //                 $scope.shipList[i].nPilots = $filter('filter')($scope.pilotList, { ship: $scope.shipList[i].name}).length;
    //             }
    //         },
    //         function (error) {
    //             $scope.error = error;
    //         }
    //     );

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

  // $http.get('../bower_components/xwing-data/data/upgrades.js')
  //     .success(
  //       function(response) {
  //         $scope.upgradeList = $filter('orderBy')(response, ['points', 'slot', 'name']);
  //       },
  //       function (error) {
  //         $scope.error = error;
  //       }
  //     );

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