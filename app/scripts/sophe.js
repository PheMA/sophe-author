angular.module('sophe', [
  'sophe.config',
  'sophe.kinetic',
  'sophe.draggable',
  'sophe.droppable',
  'sophe.doubleClickable',
  'sophe.onlyDigits',
  'sophe.valueSetsTerms',
  'sophe.factories.algorithmElement',
  'sophe.factories.kineticStage',
  'sophe.elements.fhir.dataElements',
  'sophe.elements.qdm.dataElements',
  'sophe.elements.qdm.logicalOperators',
  'sophe.elements.qdm.temporalOperators',
  'sophe.elements.qdm.subsetOperators',
  'sophe.elements.phenotype',
  'sophe.elements.valueSets',
  'sophe.elements.codeSystems',
  'sophe.services.configuration',
  'sophe.services.codeSystem',
  'sophe.services.attribute',
  'sophe.services.temporalOperator',
  'sophe.services.qdmElement',
  'sophe.services.fhirElement',
  'sophe.services.library',
  'sophe.services.logicalOperator',
  'sophe.services.subsetOperator',
  'sophe.services.url',
  'sophe.services.valueSet',
  'sophe.services.exporter']);
