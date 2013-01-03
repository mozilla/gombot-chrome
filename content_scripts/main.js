var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.PasswordForm = PasswordForm(jQuery);
Gombot.InputMonitor = InputMonitor(window.MutationObserver || window.WebKitMutationObserver);
Gombot.Linker = {};
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery, Gombot.PasswordForm, Gombot.InputMonitor);

function maybeGetAndFillCredentials(formInspector)
{
    Gombot.Messaging.messageToChrome({ type: "get_saved_credentials" }, function(credentials) {
        if (credentials.length === 0) return;
        if(_.any(credentials, function(credential) { return credential.pinLocked; })) {
            console.log('Locked!');
            Gombot.Messaging.messageToChrome({
                type: 'prompt_for_pin'
            }, function() {
                formInspector.fillForms(credentials[0]);
            });
        }
        else {
            formInspector.fillForms(credentials[0]);
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
                username: credentials.username,
                password: credentials.password
            },
            type: 'add_login'
        }
        // prompt for infobar TODO: factor this into client scripts
        Gombot.Messaging.messageToChrome(loginObj);
    };
    Gombot.Messaging.messageToChrome({ type: "get_captured_credentials" }, callback);
}

function credentialsCaptured(formInspector, credentials) {
    Gombot.Messaging.messageToChrome({ type: "set_captured_credentials",
                                   message: credentials });
}

function formsFound(formInspector) {
    formInspector.highlightForms();
    // fill any saved credentials
    maybeGetAndFillCredentials(formInspector);
}

var formInspectorObserver = {
    formsFound: formsFound,
    credentialsCaptured: credentialsCaptured
};

function start() {
    // Run on page load
    maybePromptToSaveCapturedCredentials();
    Gombot.PasswordFormInspector.start();
    Gombot.PasswordFormInspector.observe(formInspectorObserver);
}

start();