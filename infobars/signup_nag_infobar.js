window.addEventListener('load', function() {
    console.log(document.getElementById('signup-link'));
    document.getElementById('signup-link').addEventListener('click', function() {
        CompleteInfobar({
            type: 'signup_nag',
            user_action: 'launch_signup'
        });
    });
});