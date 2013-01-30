document.getElementById('save-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_observed',
        user_action: 'save'
    });
});

document.getElementById('pin-lock-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_observed',
        user_action: 'pin_lock'
    });
});

document.getElementById('never-for-this-site-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_observed',
        user_action: 'never_for_this_site'
    });
});

window.addEventListener('load', function() {
    document.getElementById('infobar-close-button').addEventListener('click', function(e) {
        CompleteInfobar({
            type: 'password_observed',
            user_action: 'dismissed'
        });
        // infobar-close-button is an anchor element, so make sure the default link behavior
        // doesn't happen.
        e.preventDefault();
        return false;
    });
});