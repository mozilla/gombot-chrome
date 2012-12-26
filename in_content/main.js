function markDetected(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
}

function highlightLoginForms() {
    var res = PasswordFormInspector.findForms(),
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
    var passwordCounterTest = (function() {
        var passwordCount = $('input[type=password]').length;
        return function() {
            var newPasswordCount = $('input[type=password]').length,
                result = false;
            result = newPasswordCount > passwordCount;
            passwordCount = newPasswordCount;
            return result;
        };
    })(),
        conditionMonitor = new ConditionMonitor(passwordCounterTest, highlightLoginForms);
    highlightLoginForms();
    conditionMonitor.start();
}

start();