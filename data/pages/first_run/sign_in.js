$(document).ready(function() {
    var messenger = ContentMessaging();

    var busy = false;

    $('#sign-in-form').submit(function(e) {
        e.preventDefault();
        if (busy) return;
        busy = true;
        ProgressIndicator.show();
        $('#sign-in-form').removeClass('invalid');
        var email = $('[name="email"]').get()[0].value.trim();
        var password = $('[name="password"]').get()[0].value;

        messenger.messageToChrome({
          type: 'sign_in',
          message: {
            email: email,
            password: password
          }
        }, function(err) {
          if (err) {
            $('#sign-in-form').addClass('invalid');
            ProgressIndicator.hide();
            busy = false;
          } else {
            ProgressIndicator.hide();
            //window.location = '/data/pages/first_run/success.html';
          }
        });
    });
});
