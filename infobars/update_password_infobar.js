window.addEventListener('load', function() {
    document.getElementById('update-button').addEventListener('click', function() {
        CompleteInfobar({
            type: 'update_password',
            user_action: 'do_update'
        });
    });
});