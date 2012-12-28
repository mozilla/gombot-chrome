var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery);
Gombot.PasswordFormObserver = PasswordFormObserver(jQuery);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);

function markDetected(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
}

function captureCredentials(form) {
    console.log(form);
    delete form.containingEl;
    Gombot.Messaging.messageToChrome({ type: "set_captured_credentials",
                                       message: form });
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

function start() {
    // Run on page load
    Gombot.Messaging.messageToChrome({ type: "get_captured_credentials" }, function(credentials) { console.log("Previously captured credentials", credentials); });
    var inputMonitor = new Gombot.InputMonitor(highlightLoginForms);
    highlightLoginForms();
    inputMonitor.start();
}

start();