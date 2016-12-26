'use strict';
angular.module('main')
.controller('MenuCtrl', function ($scope, mongoDB, $log, $ionicModal, $ionicPopup, $ionicLoading, AuthService, UserService) {

  $scope.show = function () {
    $ionicLoading.show({
      template: 'Loading...'
    }).then( function () {
      // console.log("The loading indicator is now displayed");
    });
  };
  $scope.hide = function () {
    $ionicLoading.hide().then( function () {
      // console.log("The loading indicator is now hidden");
    });
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

  $ionicModal.fromTemplateUrl('main/templates/modal-login.html', {
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

  UserService.getCurrentUser().then(
    function (response) {
      $scope.currentUser = response;
    },
    function (error) {
      return error;
    }
  );

  $scope.login = function (user) {
    AuthService.login(user).then(
      function () {
        $scope.currentUser = UserService.currentUser();
        $scope.closeModal();
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
    AuthService.logout();
    $scope.currentUser = undefined;
  };

});
