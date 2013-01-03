var PasswordForm = function($) {

	function notifyObserver(fn) {
		var args;
	  if (this.observer[fn]) {
        args = Array.prototype.slice.call(arguments,1);
        args.unshift(this);
	      this.observer[fn].apply(this.observer, args);
	  }
	}

	var PasswordForm = function(id, usernameField, passwordField, containingEl) {
		this.id = id;
		this.usernameField = usernameField;
		this.passwordField = passwordField;
		this.containingEl = containingEl;
		this.$containingEl = $(this.containingEl);
		// "input" event will capture paste input and key by key input on modern browsers
		// Note: this will not trigger when values are filled by javsacript or the browser
		this.inputEvents = "input."+this.id;
		this.submitEvents = "submit."+this.id;
		this.observer = null;
	};

	// TODO: consider whether to make this a multiple event thingy
	// We could have each form individually monitor when it disappears or
	// becomes visible, invisible, or removed.
	PasswordForm.prototype.observe = function(observer) {
		this.observer = observer;
		var boundNotifyObserver = notifyObserver.bind(this);
		var capturedCredentialsNotify = function(event) {
			boundNotifyObserver("credentialsCaptured");
		};
		this.$containingEl.on(this.inputEvents, "input", capturedCredentialsNotify);
		this.$containingEl.on(this.submitEvents, capturedCredentialsNotify);
		return this;
	};

	PasswordForm.prototype.unobserve = function() {
		this.$containingEl.off(this.inputEvents);
		this.$containingEl.off(this.submitEvents);
		this.observer = null;
		return this;
	};

	PasswordForm.prototype.fill = function(credentials) {
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