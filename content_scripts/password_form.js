var PasswordForm = function($) {

	function extractCredentials(event) {
		var result = { formId: this.id, usernames: {}, password: "" },
		    usernameFieldNames;
		usernameFieldNames = Object.getOwnPropertyNames(this.usernameFields);
		usernameFieldNames.forEach((function(usernameFieldName) {
			result.usernames[usernameFieldName] = this.usernameFields[usernameFieldName].el.value;
		}).bind(this));
		result.password = this.passwordField.el.value;
		//console.log("Extracting credentials:", result);
		this.observerCallback(result);
	}

	var PasswordForm = function(id, usernameFields, passwordField, containingEl) {
		this.id = id;
		this.usernameFields = usernameFields;
		this.passwordField = passwordField;
		this.containingEl = containingEl;
		this.$containingEl = $(this.containingEl);
		this.observerCallback = null;
		// "input" event will capture paste input and key by key input on modern browsers
		// Note: this will not trigger when values are filled by javsacript or the browser
		this.inputEvents = "input."+this.id;
		this.submitEvents = "submit."+this.id;
	};

	// TODO: consider whether to make this a multiple event thingy
	// We could have each form individually monitor when it disappears or
	// becomes visible, invisible, or removed.
	PasswordForm.prototype.observe = function(observerCallback) {
		this.observerCallback = observerCallback;
		var boundExtractCredentials = extractCredentials.bind(this);
		this.$containingEl.on(this.inputEvents, "input", boundExtractCredentials);
		this.$containingEl.on(this.submitEvents, boundExtractCredentials);
		return this;
	};

	PasswordForm.prototype.unobserve = function() {
		this.$containingEl.off(this.inputEvents);
		this.$containingEl.off(this.submitEvents);
		this.observerCallback = null;
		return this;
	};

	PasswordForm.prototype.fill = function(usernames, password) {
		var usernameFieldNames = Object.getOwnPropertyNames(this.usernameFields);
		usernameFieldNames.forEach((function(usernameFieldName) {
			this.usernameFields[usernameFieldName].el.value = usernames[usernameFieldName];
		}).bind(this));
		this.passwordField.el.value = password;
		return this;
	};

	function highlightEl(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
	}

	PasswordForm.prototype.highlight = function() {
    var usernameFieldNames = Object.getOwnPropertyNames(this.usernameFields);
    usernameFieldNames.forEach(function(usernameFieldName) {
    	highlightEl(this.usernameFields[usernameFieldName].el, "blue");
    }, this);
    if (usernameFieldNames.length === 0) {
    	console.log("No username field found for", this);
    }
    if (this.passwordField.el) {
      highlightEl(this.passwordField.el, "green")
    } else {
      console.log("No password field found for", this);
    }
    if (this.containingEl) {
      highlightEl(this.containingEl, "red");
    } else {
      console.log("No containing form field found for", this);
    };
    return this;
	};

	return PasswordForm;
};