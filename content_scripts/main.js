var Gombot = {};

Gombot.PasswordFormInspector = PasswordFormInspector(jQuery);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);

function markDetected(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
}

function highlightLoginForms() {
    var res = Gombot.PasswordFormInspector.findForms(),
        loginForms = res.loginForms,
        form;
    for (var formX = 0; formX < loginForms.length; formX++) {
        form = loginForms[formX];
        if (form.usernameEl) {
            markDetected(form.usernameEl, "blue");
        } else {
            console.log("No username field found for", form);
        }
        if (form.passwordEl) {
            markDetected(form.passwordEl, "green")
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
    var inputMonitor = new Gombot.InputMonitor(highlightLoginForms);
    highlightLoginForms();
    inputMonitor.start();
}

start();