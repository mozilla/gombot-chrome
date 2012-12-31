var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.PasswordForm = PasswordForm(jQuery);
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery, Gombot.PasswordForm);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);

function markDetected(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
}

function highlightLoginForms() {
    var res = Gombot.PasswordFormInspector.findForms(),
        loginForms = res.loginForms,
        form;
    if (loginForms.length > 0) {
        Gombot.Messaging.messageToChrome({ type: "get_saved_credentials" }, function(credentials) {
            if(_.any(credentials, function(credential) { return credential.pinLocked; })) {
                console.log('Locked!');
                Gombot.Messaging.messageToChrome({
                    type: 'prompt_for_pin'
                }, function() {
                    loginForms.forEach(function(form) {
                        form.fill({ username: credentials[0].username }, credentials[0].password);
                    });                    
                });
            }
            else {
                if (credentials.length > 0) {
                    loginForms.forEach(function(form) {
                        form.fill({ username: credentials[0].username }, credentials[0].password);
                    });
                }
            }
        });
    }
    loginForms.forEach(function(loginForm) {
        loginForm.startObserver(captureCredentials);
    });
    for (var formX = 0; formX < loginForms.length; formX++) {
        form = loginForms[formX];
        var usernameFieldNames = Object.getOwnPropertyNames(form.usernameFields);
        usernameFieldNames.forEach(function(usernameFieldName) {
            markDetected(form.usernameFields[usernameFieldName].el, "blue");
        });
        if (usernameFieldNames.length === 0) {
            console.log("No username field found for", form);
        }
        if (form.passwordField.el) {
            markDetected(form.passwordField.el, "green")
        } else {
            console.log("No password field found for", form);
        }
        if (form.containingEl) {
            markDetected(form.containingEl, "red");
        } else {
            console.log("No containing form field found for", form);
        }
    }
}

function captureCredentials(form) {
    delete form.containingEl;
    Gombot.Messaging.messageToChrome({ type: "set_captured_credentials",
                                       message: form });
}

function maybePromptToSaveCapturedCredentials() {
    var callback = function(credentials) {
        if (!credentials) return;
        var loginObj = {
            message: {
                hostname: credentials.domain,
                username: credentials.usernames.username,
                password: credentials.password
            },
            type: 'add_login'
        }
        // prompt for infobar TODO: factor this into client scripts
        Gombot.Messaging.messageToChrome(loginObj);
    };
    Gombot.Messaging.messageToChrome({ type: "get_captured_credentials" }, callback);
}

function start() {
    // Run on page load
    maybePromptToSaveCapturedCredentials();
    var inputMonitor = new Gombot.InputMonitor(highlightLoginForms);
    highlightLoginForms();
    inputMonitor.start();
}

start();