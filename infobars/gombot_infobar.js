window.addEventListener('load', function() {
    document.getElementById('infobar-close-button').addEventListener('click', function(e) {
        CompleteInfobar({});
        // infobar-close-button is an anchor element, so make sure the default link behavior
        // doesn't happen.
        e.preventDefault();
        return false;
    });
});