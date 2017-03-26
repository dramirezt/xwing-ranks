'use strict';
angular.module('main')

.controller('RegisterCtrl', function ($scope, $state, $filter, $ionicLoading, UserService, AuthService) {

  $scope.newUser = { username: '', password: '', password2: '' };

  $scope.createUser = function () {
    if($scope.newUser.password === $scope.newUser.password2){
      $scope.showLoading();
      var user = { username: $scope.newUser.username, password: $scope.newUser.password }
      UserService.createUser(user).then(
        function (response) {
          AuthService.logout();
          // console.log(response);
          $scope.login(user);
          // AuthService.login(user).then(
          //   function () {
          //     $scope.newUser = { username: '', password: '', password2: '' };
          //     $scope.hideLoading();
          //   },
          //   function (error) {
          //     $ionicPopup.alert({
          //       title: 'Login failed!',
          //       template: error
          //     });
          //   }
          // );
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      )
    } else {
      // Show error
    }
  }

})
;
