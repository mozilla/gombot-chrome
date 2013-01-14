var LoginCredentialCollection = function(Backbone, _, LoginCredential) {

	var LoginCredentialCollection = Backbone.Collection.extend({
		model: LoginCredential
	});

	return LoginCredentialCollection;
};
