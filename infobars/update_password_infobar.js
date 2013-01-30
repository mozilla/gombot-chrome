window.addEventListener('load', function() {
    document.getElementById('update-button').addEventListener('click', function() {
        CompleteInfobar({
            type: 'update_password',
            user_action: 'do_update'
        });
    });
});

window.addEventListener('load', function() {
    document.getElementById('infobar-close-button').addEventListener('click', function(e) {
        CompleteInfobar({
            type: 'update_password',
            user_action: 'dismissed'
        });
        // infobar-close-button is an anchor element, so make sure the default link behavior
        // doesn't happen.
        e.preventDefault();
        return false;
    });
});