var Realms = function(SiteConfigs, TldService) {

	var realmMap = {};

	function buildRealmMap(siteConfigs) {
		var realms = Object.getOwnPropertyNames(siteConfigs);
		realmMap = {};
		realms.forEach(function(realm) {
			var domains = siteConfigs[realm].domains;
			// presence of a domain field indicates it's a complex realm
			if (domains) {
				domains.forEach(function(domain) {
					realmMap[domain] = realm;
				});
			}
		});
	}

	function getRealm(domain) {
		domain = TldService.getDomain(domain);
		return realmMap[domain] || domain;
	}

	buildRealmMap(SiteConfigs);

	return {
		buildRealmMap: buildRealmMap,
		getRealm: getRealm
	};
}