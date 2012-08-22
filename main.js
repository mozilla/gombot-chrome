const SKYCRANE_SERVER  = 'http://localhost:8000';

var socket = io.connect(SKYCRANE_SERVER);

console.log('In chrome script');

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url: /*SKYCRANE_SERVER + "*/"login.html"
    });
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'add_login') {
        socket.emit('add_login',request.message);
    }
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
  });