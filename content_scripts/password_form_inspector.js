var PasswordFormInspector = function($, PasswordForm, DomMonitor) {
    var running = false;

    var observers = [];

    var idCounter = 0;

    var passwordForms = [];

    var siteConfig = {};

    function generateId() {
        idCounter += 1;
        return idCounter;
    }

    function findMultistageForms() {
        var $un;
        if (!siteConfig.multiStage) return [];
        $un = $(siteConfig.un);
        if ($un.length === 0) return [];
        return [ new PasswordForm(generateId(),
                                  null,
                                  getFormForElement($un),
                                  siteConfig) ];
    }

    function getFormForElement($el) {
        var $closestForm = $el.closest('form');
        if ($closestForm.length === 0) {
            // Could not find an HTML form, so now just look for any element that
            // contains both the password field and some other input field with type=text.
            // Note: this will also find inputs with no type specified, which defaults to text.
            console.log("Could not find form element for el=", $el.get(0));
            $closestForm = $el.parents().has('input:text');
            if ($closestForm.length === 0) {
                $closestForm = $('body');
            }
        }
        return $closestForm;
    }

    function findForms() {
        var $passwordInputs = $('input[type=password]');
        var oldPasswordForms = passwordForms; // TODO: clean these up
        passwordForms = [];
        $passwordInputs.each(function(idx,passwordEl) {
            var $passwordEl = $(passwordEl),
                $containingForm = getFormForElement($passwordEl),
                numPasswordInputs = $containingForm.find('input[type=password]').length;
            // If the containing form contains multiple password field, then ignore
            // for now. This is probably a change password field.
            if (numPasswordInputs > 1) return;
            passwordForms.push(new PasswordForm(generateId(),
                                                passwordEl,
                                                $containingForm.get(0),
                                                siteConfig));
        });
        passwordForms = passwordForms.concat(findMultistageForms());
        observeForms();
    }

    function credentialsCaptured(passwordForm) {
        var creds = { formId: passwordForm.id,
                      username: passwordForm.getUsername(),
                      password: passwordForm.getPassword() };
        visitObservers("credentialsCaptured", creds);
    }

    function link(passwordForm) {
        visitObservers("link");
    }

    var passwordFormObserver = {
        credentialsCaptured: credentialsCaptured,
        link: link
    };

    // internal function to start observing the form collection
    // Currently just notifies observers of captured credentials
    function observeForms() {
        passwordForms.forEach(function(form) {
            form.observe(passwordFormObserver);
        });
    }

    function visitObservers(fn) {
        var args = Array.prototype.slice.call(arguments,1);
        args.unshift(self);
        observers.forEach(function(o) {
            if (o[fn]) {
                o[fn].apply(o, args);
            }
        });
    }

    function domMonitorCallback() {
        findForms();
        visitObservers("formsFound", passwordForms);
    }

    // PUBLIC SECTION

    function observe(observer) {
        if (!running) {
            start();
        }
        observers.push(observer);
        // if we have password forms, then notify observer immediately
        if (passwordForms.length > 0 && observer.formsFound) {
            observer.formsFound(self);
        }
    }

    function setConfig(config) {
        siteConfig = config;
        passwordForms.forEach(function(form) { form.config = siteConfig; });
    }

    // highlights all password forms on page
    function highlight() {
        passwordForms.forEach(function(form) {
            form.highlight();
        });
    }

    function fill(credentials) {
        passwordForms.forEach(function(form) {
            form.fill(credentials);
        });
    }

    function start() {
        if (!running) {
            running = true;
            findForms();
            DomMonitor.on("addedNodes", "input", domMonitorCallback);
        }
    }

    function stop() {
        if (running) {
            DomMonitor.off("addedNodes", domMonitorCallback);
            running = false;
        }
    }

    var self = {
        start: start,
        observe: observe,
        setConfig: setConfig,
        fillForms: fill,
        highlightForms: highlight,
        stop: stop
    };
    return self;
};
