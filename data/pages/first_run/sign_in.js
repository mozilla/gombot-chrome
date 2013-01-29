var messenger;
$(document).ready(function() {
  messenger = PageMessaging();

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
        messenger.messageToChrome({
          type: 'navigate_to',
          message: {
            resource: 'success'
          }
        });
      }
    });
  });
});
