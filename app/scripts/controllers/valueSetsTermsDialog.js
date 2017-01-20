'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsDialogController
 * @description
 * This is used from the phenotype editor as a special case for defining a value set for an element.  When an element is
 * created by default, it has an empty "slot" that can be clicked on to find/create a value set.  That is when this dialog
 * will get invoked, which means it's only called whenever no value set is defined for an element (at least, that's the
 * assumption we're going to make going forward).
 * 
 * This dialog is paired with views/elements/valueSetsTermsDialog.html, which in turn uses the value-sets-terms directive
 * (see ValueSetsTermsController).
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsDialogController', ['$scope', '$http', '$modalInstance', 'ValueSetService', 'ConfigurationService',
  function ($scope, $http, $modalInstance, ValueSetService, ConfigurationService) {
    // Because we use the ValueSetsTerms directive, and this is only ever called when no value set is defined for an element,
    // we make sure to clear out/disable the scope variables that would control an editable existing value set.  That way, this
    // dialog will only show the search and create value set tabs.
    $scope.existingValueSet = null;
    $scope.existingValueSetEditable = false;

    $scope.ok = function () {
      // If it's not 1, we default to 0 (which means the "select value set" tab was active)
      if ($scope.selectedTabIndex === 1) {
        ConfigurationService.load().then(function(config) {
          var editableServiceId = 'phema';
          if (config && config.valueSetServices) {
            for (var key in config.valueSetServices) {
              if (config.valueSetServices[key].writable) {
                editableServiceId = key;
                break;
              }
            }
          }

          $scope.selectedValueSets = null;
          $scope.newValueSet.terms = $scope.selectedTerms;
          ValueSetService.save(editableServiceId, $scope.newValueSet)
            .then(function(valueSet) {
              ValueSetService.loadSingle(editableServiceId, valueSet.oid).then(ValueSetService.processSingleValue).then(function(valueSet){
                valueSet.valueSetRepository = editableServiceId;
                $scope.newValueSet = valueSet;
                $modalInstance.close({valueSets: null, newValueSet: $scope.newValueSet});
              });
            });
        });
      }
      else {
        $modalInstance.close({valueSets: $scope.selectedValueSets, newValueSet: null});
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}]);
