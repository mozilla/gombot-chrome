var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.PasswordForm = PasswordForm(jQuery);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);
Gombot.Linker = {};
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery, Gombot.PasswordForm, Gombot.InputMonitor, Gombot.Linker);

function maybeGetAndFillCredentials(loginForms)
{
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


function maybePromptToSaveCapturedCredentials() {
    var callback = function(credentials) {
        // if missing credentials or missing password then return
        if (!credentials || !credentials.password) return;
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

function credentialsCaptured(form) {
    Gombot.Messaging.messageToChrome({ type: "set_captured_credentials",
                                   message: form });
}

function formsFound(forms) {
    forms.forEach(function(form) {
        form.highlight();
    });
    // fill any saved credentials
    if (forms.length > 0) {
        maybeGetAndFillCredentials(forms);
    }
}

var observer = {
    formsFound: formsFound,
    credentialsCaptured: credentialsCaptured
};


function start() {
    // Run on page load
    maybePromptToSaveCapturedCredentials();
    Gombot.PasswordFormInspector.start();
    Gombot.PasswordFormInspector.observe(observer);
    // TODO: start password form inspector and add observer
}

start();