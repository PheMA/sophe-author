angular.module('sophe.config', [])
.constant('environment', 'phekb')
.constant('dataServiceBaseUrl', 'api/qdm/')
.constant('fhirServiceBaseUrl', 'api/fhir/')
.constant('libraryBaseUrl', 'api/library/')
.constant('valueSetServiceBaseUrl', 'api/valueset/')
.constant('codeSystemServiceBaseUrl', 'api/codesystem/')
.constant('configServiceBaseUrl', 'api/config/')
.constant('exporterServiceBaseUrl', 'api/export/')
.constant('unitServiceBaseUrl', 'api/units/')
.constant('userServiceBaseUrl', 'api/user/')
.constant('authenticationType', 'phekb')
;