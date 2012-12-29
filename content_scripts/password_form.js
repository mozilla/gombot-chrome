var PasswordForm = function($) {

	function extractCredentials(event) {
		var result = { formId: this.id, usernames: {}, password: "", containingEl: this.containingEl },
		    usernameFieldNames;
		usernameFieldNames = Object.getOwnPropertyNames(this.usernameFields);
		usernameFieldNames.forEach((function(usernameFieldName) {
			result.usernames[usernameFieldName] = this.usernameFields[usernameFieldName].el.value;
		}).bind(this));
		result.password = this.passwordField.el.value;
		this.observerCallback(result);
	}

	var PasswordForm = function(id, usernameFields, passwordField, containingEl) {
		this.id = id;
		this.usernameFields = usernameFields;
		this.passwordField = passwordField;
		this.containingEl = containingEl;
		this.$containingEl = $(this.containingEl);
		this.observerCallback = null;
	};

	PasswordForm.prototype.startObserver = function(observerCallback) {
		this.observerCallback = observerCallback;
		var boundExtractCredentials = extractCredentials.bind(this);
		this.$containingEl.on("change."+this.id, "input", boundExtractCredentials);
		this.$containingEl.on("submit."+this.id, boundExtractCredentials);
	};

	PasswordForm.prototype.stopObserver = function() {
		this.$containingEl.off("change."+this.id);
		this.$containingEl.off("submit."+this.id);
		this.observerCallback = null;
	};

	PasswordForm.prototype.fill = function(usernames, password) {
		var usernameFieldNames = Object.getOwnPropertyNames(this.usernameFields);
		usernameFieldNames.forEach((function(usernameFieldName) {
			this.usernameFields[usernameFieldName].el.value = usernames[usernameFieldName];
		}).bind(this));
		this.passwordField.el.value = password;
	};

	return PasswordForm;
};