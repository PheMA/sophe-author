/* globals _ */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsController
 * @description
 * # ValueSetsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsController', ['$scope', '$http', 'ValueSetService', function ($scope, $http, ValueSetService) {
  $scope.searchTerm = '';
  $scope.isSearching = false;
  $scope.searchResults = [];
  $scope.selectedValueSets = [];

  var filterAction = function($scope) {
    if ($scope.searchTerm === '') {
      $scope.isSearching = false;
      $scope.searchResults = [];
    }
    else {
      $scope.isSearching = true;
      ValueSetService.search($scope.searchTerm)
        .then(ValueSetService.processValues)
        .then(function(valueSets) {
          $scope.searchResults = valueSets;
          $scope.isSearching = false;
        });
    }
  };

  var filterDelayed = function($scope) {
    $scope.$apply(function(){filterAction($scope);});
  };

  var filterThrottled = _.debounce(filterDelayed, 750);
  $scope.$watch('searchTerm', function(){filterThrottled($scope);});

  // Used for multi-selection mode
  $scope.addToList = function(valueSet) {
    if (_.where($scope.selectedValueSets, {id: valueSet.id}).length === 0) {
      $scope.selectedValueSets.push(angular.copy(valueSet));
    }
  };

  $scope.removeFromList = function(valueSet) {
    $scope.selectedValueSets = _.filter($scope.selectedValueSets, function(item) {
      return item.id !== valueSet.id;
    });
  };

  // Used for single-selection mode
  $scope.setSelected = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
  };
}]);