window.addEventListener('load', function() {
    document.getElementById('signup-link').addEventListener('click', function() {
        CompleteInfobar({
            type: 'signup_nag',
            user_action: 'launch_signup'
        });
    });
});

window.addEventListener('load', function() {
    document.getElementById('infobar-close-button').addEventListener('click', function(e) {
        CompleteInfobar({
            type: 'signup_nag',
            user_action: 'dismissed'
        });
        // infobar-close-button is an anchor element, so make sure the default link behavior
        // doesn't happen.
        e.preventDefault();
        return false;
    });
});