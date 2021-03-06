'use strict';
var request = require('request');
const uuid = require('uuid');
var CTS2Util = require('../cts2/cts2Util').CTS2Util;
var util = require('../util');

// Provides a wrapper around multiple value set services.  Currently, support exists for CTS2 and VSAC.
// A consistent output format (based on CTS2) comes from this service, so that for all the value set
// services we map to, only one output format is needed.
//
// This was originally written to wrap CTS2 calls so we can safely invoke from our client without
// having to worry about cross-domain requests.  Given needs to expand the number of services supported,
// the purpose of this repository class has expanded.

// id - the identifier of the repository, used to distinguish it from other value sets
// repoType - the type of value set repository ('vsac' or 'cts2')
// baseURL - the base URL to the CTS2 endpoint, including the trailing slash
// baseOID - OPTIONAL - only used for writable repositories.  This is the base OID used when creating new value set entries.
var CTS2ValueSetRepository = function(id, baseURL, baseOID) {
  console.log(baseURL);
  this.id = id;
  this.baseURL = baseURL;
  this.cts2Util = new CTS2Util(baseURL);
  this.baseOID = baseOID;
};

CTS2ValueSetRepository.prototype.getValueSets = function(callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?format=json', json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of value sets'});
    }
  });
};

CTS2ValueSetRepository.prototype.searchValueSets = function(search, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?matchvalue=' + search + '&format=json', json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to search the list of value sets'});
    }
  });
};

CTS2ValueSetRepository.prototype.getValueSet = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '?format=json', json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value sets'});
    }
  });
};

CTS2ValueSetRepository.prototype.getValueSetMembers = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '/resolution?format=json', json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value set members'});
    }
  });
};

// The CTS2 entry is the first "wrapper" around an actual value set definition.
// For more information on the PhEMA value set structure, see doc/cts2-notes.txt
function mapValueSetToCTS2Entry(data) {
  return {
    "valueset" : {
      "about": data['id'],
      "formalName": data['name'],
      "valueSetName": data['id'],
      "sourceAndRole": [
        {
          "source": {
            "uri": "http://www.projectphema.org/authoring-tool",
            "name" : "PhEMA Authoring Tool"
          },
          "role": {
            "uri": "http://purl.org/dc/elements/1.1/creator",
            "name": "creator"
          }
        }
      ]
    }
  };
}

function getCTS2TermList(data) {
  var terms = [];
  for (var index in data['terms']) {
    var term = data['terms'][index];
    terms.push({
      "uri": term['uri'],
      "namespace": term['codeSystem'],
      "name": term['id'],
      "designation": term['name']
    });
  }
  return terms;
}

// The CTS2 definition uses the entry (created first) and provides the details,
// including which code(s) are part of the value set.
// For more information on the PhEMA value set structure, see doc/cts2-notes.txt
function mapValueSetToCTS2Definition(data, existingVersion) {
  var oid = data['id'];
  var version = (data['version'] ? data['version'] : uuid.v1());
  var versionTag = oid + '_' + version;
  var uri = oid + '_' + (existingVersion ? existingVersion : version);
  var definition = {
    "valueSetDefinition": {
      "definedValueSet": {
        "uri": "urn:oid:" + oid,
        "content": oid
      },
      "versionTag": [
        {
          "uri": version,
          "content": version
        }
      ],
      "sourceAndRole": [
        {
          "source": {
            "uri": "http://www.projectphema.org/authoring-tool",
            "name" : "PhEMA Authoring Tool"
          },
          "role": {
            "uri": "http://purl.org/dc/elements/1.1/creator",
            "name": "creator"
          }
        }
      ],
      "entryState": "ACTIVE",
      "about": version,
      "documentURI": version,
      "entry": [
        {
          "operator" : "UNION",
          "entryOrder": 1,
          "entity": {
            "referencedEntity" : getCTS2TermList(data)
          }
        }
      ],
      "officialResourceVersionId": version
    }
  };
  return definition;
}

CTS2ValueSetRepository.prototype.add = function(data, callback) {
  // If there is no base OID, we cannot continue
  if (util.isEmptyString(this.baseOID)) {
    return callback({message: 'The value set repository is not set up to save entries'});
  }

  // If no OID is assigned already, we will specify one using the base OID and a random ID
  var oidBlank = util.isEmptyString(data['id']);
  if (oidBlank) {
    data['id'] = this.baseOID + '.' + uuid.v4().replace(/-/g, '');
  }

  // Make sure we are including the value set repository identifier in the response.  The
  // application will need this to know who we got the value set from.
  if (!data['valueSetRepository'] || data['valueSetRepository'] === '') {
    data['valueSetRepository'] = this.id;
  }

  var cts2Util = this.cts2Util;
  cts2Util.findValueSet(data['id'], function(error, existingValueSet) {
    if (error) { return callback(error); }
    if (oidBlank && existingValueSet) { return callback({message: 'A conflicting value set definition was found'}) }
    if (existingValueSet) {
      var changeSet = existingValueSet['ValueSetCatalogEntryMsg']['valueSetCatalogEntry']['changeDescription']['containingChangeSet']
      var valueSet = mapValueSetToCTS2Entry(data);
      cts2Util.updateValueSet(data['id'], changeSet, valueSet, function(error, updatedValueSet) {
        if (error) { return callback(error); }

        var existingVersion = existingValueSet['ValueSetCatalogEntryMsg']['valueSetCatalogEntry']['currentDefinition']['valueSetDefinition']['content']
        data['version'] = existingVersion;
        console.log('Existing value set found: version=' + existingVersion);

        var valueSetDefinition = mapValueSetToCTS2Definition(data, existingVersion);
        valueSetDefinition['valueSetDefinition']['changeDescription'] = { "changeType" : "UPDATE", "containingChangeSet" : changeSet };
        cts2Util.updateValueSetDefinition(data['id'], existingVersion, changeSet, valueSetDefinition, function(error, vsdResponse) {
          if (error) { return callback(error); }
          callback(null, data);
        });
      });
    }
    else {
      cts2Util.createChangeSet(function(error, changeSet1) {
        if (error) { return callback(error); }
        var valueSet = mapValueSetToCTS2Entry(data);
        cts2Util.createValueSet(changeSet1, valueSet, function(error, vsResponse) {
          if (error) { return callback(error); }
          cts2Util.createChangeSet(function(error, changeSet2) {
            if (error) { return callback(error); }
            var valueSetDefinition = mapValueSetToCTS2Definition(data);
            cts2Util.createValueSetDefinition(changeSet2, valueSetDefinition, function(error, vsdResponse) {
              if (error) { return callback(error); }
              callback(null, data);
            });
          });
        });
      });
    }
  });
};

exports.CTS2ValueSetRepository = CTS2ValueSetRepository;