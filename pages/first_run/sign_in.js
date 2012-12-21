$(document).ready(function() {
    //var server = 'https://gombot.org';
    var server = 'http://dev.tobmog.org';
    var client = new GombotClient(server + '/api');
    var busy = false;

    $('#sign-in-form').submit(function(e) {
        e.preventDefault();
        if (busy) return;
        busy = true;
        $('#sign-in-form').removeClass('invalid');

        client.signIn({
            email: $('[name="email"]').get()[0].value,
            pass: $('[name="password"]').get()[0].value
        }, function (err) {
          busy = false;
          if (err) {
            $('#sign-in-form').addClass('invalid');
          } else {
            window.location = 'success.html';
          }
        });
    });
});
