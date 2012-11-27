document.getElementById('save-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_saved',
        user_action: 'save'
    });
});

document.getElementById('pin-lock-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_saved',
        user_action: 'pin_lock'
    });
});

document.getElementById('never-for-this-site-button').addEventListener('click',function() {
    CompleteInfobar({
        type: 'password_saved',
        user_action: 'never_for_this_site'
    });
});