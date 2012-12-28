var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery);
Gombot.PasswordFormObserver = PasswordFormObserver(jQuery);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);

function markDetected(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
}

function highlightLoginForms() {
    var res = Gombot.PasswordFormInspector.findForms(),
        loginForms = res.loginForms,
        form,
        observers = [];
    loginForms.forEach(function(loginForm) {
        observers.push(new Gombot.PasswordFormObserver(loginForm, captureCredentials));
    });
    for (var formX = 0; formX < loginForms.length; formX++) {
        form = loginForms[formX];
        if (form.usernameFields.length > 0) {
            markDetected(form.usernameFields[0].el, "blue");
        } else {
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
                username: credentials.usernames[0].username,
                password: credentials.password
            },
            type: 'add_login'
        }
        // prompt for infobar TODO: factor this into client scripts
        Gombot.Messaging.messageToChrome(loginObj);
    };
    Gombot.Messaging.messageToChrome({ type: "get_captured_credentials" }, callback);
    Gombot.Messaging.messageToChrome({ type: "get_saved_credentials" }, function(x) {
        console.log('saved credentials: ', x);
    });
}

function start() {
    // Run on page load
    maybePromptToSaveCapturedCredentials();
    var inputMonitor = new Gombot.InputMonitor(highlightLoginForms);
    highlightLoginForms();
    inputMonitor.start();
}

start();