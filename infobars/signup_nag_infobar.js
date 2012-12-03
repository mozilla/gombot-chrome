window.addEventListener('load', function() {
    document.getElementById('signup-link').addEventListener('click', function() {
        CompleteInfobar({
            type: 'signup_nag',
            user_action: 'launch_signup'
        });
    });
});