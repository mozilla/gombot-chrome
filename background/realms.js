var Realms = function(SiteConfigs, Uri, TldService) {

	var realmMap = {};

	// TODO: needs to eventually account for user-defined realms.
	// builds map of origins -> { origins: array of origins , title: realm title }
	function buildRealmMap(siteConfigs) {
		var realms = siteConfigs.realms;

		realms.forEach(function(realm) {
			var origins = realm.origins;
			// presence of a domain field indicates it's a complex realm
			if (origins) {
				origins.forEach(function(origin) {
					realmMap[origin] = realm;
				});
			}
		});
	}

	// fqOrigin cannot contain wildcards, realmOrigin may
	// TODO: make more general to account for wildcards in realmOrigins
  function fullyQualifiedOriginMatchesRealmOrigin(fqOrigin, realmOrigin) {
  	return fqOrigin === realmOrigin;
  }

  function getRealmWrapperForOriginFromRealmMap(fqOrigin) {
 		var keys = Object.getOwnPropertyNames(realmMap);
		for (var i=0;i<keys.length;i++) {
			if (fullyQualifiedOriginMatchesRealmOrigin(fqOrigin, realmMap[keys[i]].origins)) {
				return realmMap[keys[i]];
			}
		}
		return null;
  }

	// Determines a realm (array of origins, maybe with wildcards)
	// for a fully qualified origin. This will consult the realm map and if it finds
	// nothing, it will create the default realm for the origin (the origin wrapped in an array).
	// fqOrigin must be fully qualified (no wildcards)
	function getRealmForOrigin(fqOrigin) {
		var realmWrapper = getRealmWrapperForOriginFromRealmMap(fqOrigin);
		if (realmWrapper) return realmWrapper.origins;
		return [ fqOrigin ];
	}

  // extracts an origin string from a uri string
  function getOriginForUri(uriString) {
  	var uri = new Uri(uriString),
  	    origin = uri.protocol()+"://"+uri.host(),
  	    port = uri.port();
  	if (port) {
  		origin += ":"+port;
  	}
  	return origin;
  }

  function loginCredentialMatchesRealm(loginCredential, realm) {
  	// All login credentials just have one fully qualifed origin for now
  	var fqOrigin = loginCredential.get("origins")[0];
  	return isOriginMemberOfRealm(fqOrigin, realm);
  }

  function getRealmForUri(uriString) {
  	return getRealmForOrigin(getOriginForUri(uriString));
  }

  function capitaliseFirstLetter(string)
	{
    return string.charAt(0).toUpperCase() + string.slice(1);
	}

  function getTitleFromOrigin(fqOrigin) {
  	var realmWrapper = getRealmWrapperForOriginFromRealmMap(fqOrigin);
  	if (realmWrapper && realmWrapper.title) return realmWrapper.title;
  	if (TldService.isIpAddress(fqOrigin)) {
  		return TldService.getFullHostnameWithPort(fqOrigin);
  	}
  	else {
  		return capitaliseFirstLetter(TldService.getDomain(fqOrigin).split(".")[0]);
		}
  }

  // a realm is defined by an array of origins, maybe some with wildcards
  // fqOrigin must be fully qualified (no wildcards)
  function isOriginMemberOfRealm(fqOrigin, origins) {
  	var i;
  	for (i=0;i<origins.length;i++) {
  		if (fullyQualifiedOriginMatchesRealmOrigin(fqOrigin,origins[i])) {
  			return true;
  		}
  	}
  	return false;
  }

	buildRealmMap(SiteConfigs);

	// TODO: determine which of these need to be publically exposed
	return {
		buildRealmMap: buildRealmMap,
		getOriginForUri: getOriginForUri,
		getRealmForUri: getRealmForUri,
		getRealmForOrigin: getRealmForOrigin,
		isOriginMemberOfRealm: isOriginMemberOfRealm,
		getTitleFromOrigin: getTitleFromOrigin
	};
}