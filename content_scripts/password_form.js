var PasswordForm = function($, DomMonitor) {

	function notifyObserver(fn) {
		var args;
	  if (this.observer[fn]) {
        args = Array.prototype.slice.call(arguments,1);
        // Add self as first argument
        args.unshift(this);
	      this.observer[fn].apply(this.observer, args);
	  }
	}

	function passwordFieldRemovedCallback(domMonitor) {
		//console.log("PasswordForm.passwordFieldRemovedCallback username=",this.getUsername(),"password=",this.getPassword());
		// Stop listening for the password field to be removed
		DomMonitor.off("isRemoved.pwdEl"+this.id);
		if (this.getPassword()) { // if we have a password in the form
			// Notify observer of credentials in the form
			notifyObserver.call(this, "credentialsCaptured");
		}
		// Notify observers they should link if they have captured creds
		// Note: this should be called even if the password field is empty because
		// the page may have deleted the password field contents before removing it.
		notifyObserver.call(this, "link");
	}

	function capturedCredentialsCallback(event) {
		notifyObserver.call(this, "credentialsCaptured");
	}

	var PasswordForm = function(id, usernameField, passwordField, containingEl, siteConfig) {
		this.id = id;
		this.usernameField = usernameField;
		this.passwordField = passwordField;
		this.containingEl = containingEl;
		this.$containingEl = $(this.containingEl);
		this.config = siteConfig || {};
		// "input" event will capture paste input and key by key input on modern browsers
		// Note: this will not trigger when values are filled by javsacript or the browser
		this.inputEvents = "input."+this.id;
		this.submitEvents = "submit."+this.id;
		// This is an external observer interested in events on the PasswordForm,
		// most likely the PasswordFormInspector.
		this.observer = null;
		DomMonitor.on("isRemoved.pwdEl"+this.id, this.passwordField.el, passwordFieldRemovedCallback.bind(this))
	};

	// TODO: consider whether to make this a multiple event thingy
	// We could have each form individually monitor when it disappears or
	// becomes visible, invisible, or removed.
	PasswordForm.prototype.observe = function(observer) {
		this.observer = observer;
		this.$containingEl.on(this.inputEvents, "input", capturedCredentialsCallback.bind(this));
		this.$containingEl.on(this.submitEvents, capturedCredentialsCallback.bind(this));
		return this;
	};

	PasswordForm.prototype.unobserve = function() {
		this.$containingEl.off(this.inputEvents);
		this.$containingEl.off(this.submitEvents);
		this.observer = null;
		return this;
	};

	PasswordForm.prototype.fill = function(credentials) {
		var clickOn = this.config.clickOn;
		if (clickOn) {
			$(clickOn).click();
		}
		this.usernameField.el.value = credentials.username;
		this.passwordField.el.value = credentials.password;
		return this;
	};

	PasswordForm.prototype.getPassword = function() {
		if (this.passwordField.el) {
			return this.passwordField.el.value;
		}
		return "";
	};

	PasswordForm.prototype.getUsername = function() {
		if (this.usernameField.el) {
			return this.usernameField.el.value;
		}
		return "";
	};

	function highlightEl(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
	}

	PasswordForm.prototype.highlight = function() {
    if (this.usernameField.el) {
			highlightEl(this.usernameField.el, "blue");
		} else {
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