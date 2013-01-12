var LinkedSiteCollection = function(Backbone, _, LinkedSite) {

	var LinkedSiteCollection = Backbone.Collection.extend({
		model: LinkedSite,

		parse: function(resp) {
			return _.flatten(_.values(resp), true);
		},

		toJSON: function(options) {
			var result = {};
			this.each(function(model) {
				var realm = model.get("realm");
				if (!result[realm]) {
					result[realm] = [];
				}
				result[realm].push(model.toJSON(options));
			});
			return result;
		}

	});

	return LinkedSiteCollection;
};
