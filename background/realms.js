var Realms = function(SiteConfigs, Uri) {

	var realmMap = {};

	function buildRealmMap(siteConfigs) {
		var realms = siteConfigs.realms;

		realms.forEach(function(realm) {
			var origins = realm.origins;
			// presence of a domain field indicates it's a complex realm
			if (origins) {
				origins.forEach(function(origin) {
					realmMap[origin] = origins;
				});
			}
		});
	}

	function getRealmForOrigin(origin) {
		var keys = Object.getOwnPropertyNames(realmMap);
		for (var i=0;i<keys.length;i++) {
			if (originsMatch(keys[i], origin)) {
				return realmMap[keys[i]];
			}
		}
		return [ origin ];
	}

	// TODO: make more general to account for wildcards in origins
  function originsMatch(origin1, origin2 ) {
  	return origin1 === origin2;
  }

  function getOriginForUri(uriString) {
  	var uri = new Uri(uriString),
  	    origin = uri.protocol()+"://"+uri.host(),
  	    port = uri.port();
  	if (port) {
  		origin += ":"+port;
  	}
  	return origin;
  }

  // a realm is defined by an array of origins
  function isOriginMemberOfRealm(origin, origins) {
  	var i;
  	for (i=0;i<origins.length;i++) {
  		if (originsMatch(origin,origins[i])) {
  			return true;
  		}
  	}
  	return false;
  }

	buildRealmMap(SiteConfigs);

	return {
		buildRealmMap: buildRealmMap,
		getOriginForUri: getOriginForUri,
		isOriginMemberOfRealm: isOriginMemberOfRealm,
		getRealmForOrigin: getRealmForOrigin
	};
}