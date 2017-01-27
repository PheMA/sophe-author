/* globals _, ValueSet */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsController
 * @description
 * # ValueSetsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsController', ['$scope', '$http', '$timeout', 'ValueSetService', function ($scope, $http, $timeout, ValueSetService) {
  $scope.searchTerm = '';
  $scope.isSearching = false;
  $scope.searchResults = [];
  $scope.selectedValueSets = $scope.selectedValueSets || [];
  $scope.treeOptions = {
    dirSelectable: false
  };

  $scope.loadValueSetDetails = function(el) {
    $timeout(function() {
      // if(!el.node.loadDetailStatus) {
      //   ValueSetService.loadDetails(el.node.valueSetRepository, el.node.id)
      //     .then(ValueSetService.processDetails, function() {
      //       el.node.loadDetailStatus = 'error';
      //       el.node.description = ValueSetService.formatDescription(el.node);
      //       }
      //     )
      //     .then(function(details) {
      //       if (details) {
      //         el.node.terms = details.terms;
      //         el.node.codeSystems = details.codeSystems;
      //         el.node.loadDetailStatus = 'success';
      //         el.node.description = ValueSetService.formatDescription(el.node);
      //       }
      //     });
      // }
      ValueSetService.handleLoadDetails(el.node, function (valueSet) {
        el.node = valueSet;
      });
    }, 0);
  };

  $scope.$watch('searchTerm', function() {
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
  });

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

  $scope.chooseValueSet = function() {
    $scope.isSearching = !$scope.isSearchingValueSets;
  };

  $scope.saveValueSet = function() {
    $scope.selectedValueSets[0] = ValueSet.createElementFromData({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
    $scope.isSearching = false;
  };

  $scope.cancelValueSet = function() {
    $scope.isSearching = false;
  };

  $scope.reset = function() {
    $scope.selectedValueSets = [];
  };
}]);
