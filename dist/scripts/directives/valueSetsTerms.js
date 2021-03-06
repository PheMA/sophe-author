'use strict';

angular.module('sophe.valueSetsTerms', [])
  .directive('valueSetsTerms', [function() {
  var directive = {
    templateUrl: 'views/elements/valueSetsTerms.html',
    restrict: 'EA',
    controller: 'ValueSetsTermsController',
    replace: true,
    scope: {
      selectedValueSets: '=?',
      selectedTerms: '=?',
      existingValueSet: '=?',
      existingValueSetEditable: '=?',
      selectedTab: '=?',
      newValueSet: '=?'
    }
  };
  return directive;
}]);