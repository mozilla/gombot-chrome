var UserCollection = function(Backbone, _, User, LocalStorage) {

	var UserCollection = Backbone.Collection.extend({
		model: User,
		localStorage: LocalStorage
	});

	return UserCollection;
};