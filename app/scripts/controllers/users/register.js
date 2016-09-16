'use strict';

angular.module('sopheAuthorApp')
.controller('RegisterFormController', ['$scope', '$location', 'UserService', function($scope, $location, UserService) {
  $scope.credentials = {
    email: '',
    password: '',
    confirm_password: ''
  };
  $scope.first_name = '';
  $scope.last_name = '';

  $scope.register = function (credentials) {
    $scope.authError = '';
    UserService.add(this.credentials.email, this.credentials.password, this.credentials.confirm_password, this.first_name, this.last_name, function(error, result){
      if (error) {
        $scope.authError = error;
      }
      else {
        $location.path("/login");
      }
    });
  };

  $scope.cancel = function() {
    $location.path("/");
  };
}]);