var Gombot = {};

Gombot.Messaging = ContentMessaging();
Gombot.MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
Gombot.DomMonitor = DomMonitor(jQuery, Gombot.MutationObserver);
Gombot.PasswordForm = PasswordForm(jQuery, Gombot.DomMonitor);
Gombot.PasswordFormInspector = PasswordFormInspector(jQuery, Gombot.PasswordForm, Gombot.DomMonitor);

function maybeGetAndFillCredentials(formInspector)
{
    Gombot.Messaging.messageToChrome({ type: "get_saved_credentials" }, function(credentials) {
        // TODO: remove this _.isArray check it was for debugging
        if (!_.isArray(credentials) || credentials.length === 0) return;
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
            message: credentials,
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
    credentialsCaptured: credentialsCaptured,
    link: maybePromptToSaveCapturedCredentials
};

function start() {
    // Run on page load
    maybePromptToSaveCapturedCredentials();
    Gombot.DomMonitor.start();
    Gombot.PasswordFormInspector.observe(formInspectorObserver);
}

Gombot.Messaging.messageToChrome({type: "get_site_config"}, function(config) {
    Gombot.PasswordFormInspector.setConfig(config);
    // Give the page time to get it's shit together before we start doing stuff
    setTimeout(start, 250);
});