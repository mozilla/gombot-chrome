$(document).ready(function() {
    var server = 'https://gombot.org';
    var client = new GombotClient(server + '/api');
    var busy = false;

    // seed entropy
    client.context({}, function(err, data) {
        client.timeOffset = (new Date()/1000 >>> 0) - data.server_time;
    });

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
            // Mark first run experience finished
            chrome.extension.getBackgroundPage().firstRunFinished();
            window.location = 'success.html';
          }
        });
    });
});
