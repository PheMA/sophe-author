'use strict';

angular.module('sopheAuthorApp')
.controller('UserController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
  $scope.user = {username: 'john.doe', password: 'foobar'};
  $scope.message = '';
  $scope.login = function () {
    $http
      .post('/login', $scope.user)
      .then(
        function (response) {
          var data = response.data;
          $window.sessionStorage.token = data.token;
          $window.sessionStorage.user = data.user;
          $scope.message = 'Welcome';
        },
        function () {
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;
          delete $window.sessionStorage.user;

          // Handle login errors here
          $scope.message = 'Error: Invalid user or password';
        }
      );
  };
}]);