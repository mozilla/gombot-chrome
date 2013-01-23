var Realms = function(Gombot, SiteConfigs, Uri) {

	var realms = [];

	function buildRealms(siteConfigs) {
		realms = siteConfigs.realms;
	}

	// fqOrigin cannot contain wildcards, realmOrigin may
	// TODO: make more general to account for wildcards in realmOrigins
  function fullyQualifiedOriginMatchesRealmOrigin(fqOrigin, realmOrigin) {
  	return fqOrigin === realmOrigin;
  }

  function getRealmWrapperForOrigin(fqOrigin) {
 		var length = realms.length;
		for (var i=0;i<length;i++) {
			if (isOriginMemberOfRealm(fqOrigin,realms[i].origins)) {
				return realms[i];
			}
		}
		return null;
  }

	// Determines a realm (array of origins, maybe with wildcards)
	// for a fully qualified origin. This will consult the realm map and if it finds
	// nothing, it will create the default realm for the origin (the origin wrapped in an array).
	// fqOrigin must be fully qualified (no wildcards)
	function getRealmForOrigin(fqOrigin) {
		var realmWrapper = getRealmWrapperForOrigin(fqOrigin);
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

  function getRealmForUri(uriString) {
  	return getRealmForOrigin(getOriginForUri(uriString));
  }

  function capitaliseFirstLetter(string)
	{
    return string.charAt(0).toUpperCase() + string.slice(1);
	}

  function getTitleFromUri(uri) {
  	var origin = getOriginForUri(uri);
  	var realmWrapper = getRealmWrapperForOrigin(origin);
  	if (realmWrapper && realmWrapper.title) return realmWrapper.title;
  	if (Gombot.TldService.isIpAddress(origin)) {
  		return Gombot.TldService.getFullHostnameWithPort(origin);
  	}
  	else {
  		return capitaliseFirstLetter(Gombot.TldService.getDomain(origin).split(".")[0]);
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

  function isUriMemberOfRealm(uri, origins) {
  	return isOriginMemberOfRealm(getOriginForUri(uri), origins);
  }

	buildRealms(SiteConfigs);

	return {
		buildRealms: buildRealms,
		getRealmForOrigin: getRealmForOrigin,
		getOriginForUri: getOriginForUri,
		getRealmForUri: getRealmForUri,
		isUriMemberOfRealm: isUriMemberOfRealm,
		getTitleFromUri: getTitleFromUri
	};
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Realms;
}
