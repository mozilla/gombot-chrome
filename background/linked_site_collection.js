var LinkedSiteCollection = function(Backbone, LinkedSite) {

	var LinkedSiteCollection = Backbone.Collection.extend({
		model: LinkedSite,
		initializeFromRealmLoginMap: function(logins) {
			var realms = _.keys(logins);
			realms.forEach((function(realm) {
				this.add(linkedSites[realm]);
			}).bind(this));
		});
	});

	return LinkedSiteCollection;
};
