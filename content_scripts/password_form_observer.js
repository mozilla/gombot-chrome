var PasswordFormObserver = function($) {

	function extractCredentials(event) {
		var result = { id: this.formId, usernames: [], password: "", containingEl: this.$containingEl.get(0) };
		this.usernameFields.forEach(function(usernameField) {
			var username = {};
			username[usernameField.name] = usernameField.el.value;
			result.usernames.push(username);
		});
		result.password = this.passwordField.el.value;
		this.callback(result);
	}

	var PasswordFormObserver = function(form, callback) {
		var boundExtractCredentials = extractCredentials.bind(this);
		this.usernameFields = form.usernameFields;
		this.passwordField = form.passwordField;
		this.$containingEl = $(form.containingEl);
		this.formId = form.id || Math.floor(Math.random*1000000);
		this.callback = callback;
		this.$containingEl.on("change."+this.formId, "input", boundExtractCredentials);
		this.$containingEl.on("submit."+this.formId, boundExtractCredentials);
	};

	PasswordFormObserver.prototype.extractCredentials = function() {
		extractCredentials.call(this);
	}

	PasswordFormObserver.prototype.release = function () {
		this.$containingEl.off("change."+this.formId);
		this.$containingEl.off("submit."+this.formId);
	};

	return PasswordFormObserver;
};