var ContentMessaging = function() {

  var addChromeMessageListener,
      messageToChrome;
  console.log("running content messaging");
  if (typeof chrome !== "undefined") { // for Chrome
    addChromeMessageListener = function(callback) {
      chrome.extension.onMessage.addListener(callback);
    }

    messageToChrome = function(message, callback) {
      callback = callback || function() {};
      chrome.extension.sendMessage(message, callback);
    }
  }
  else { // for Firefox
    (function() {
      var callbacks = {}

      var idCounter = 0;

      var chomeMessageListener = null;

      function getCallbackId() {
        idCounter += 1;
        return idCounter;
      }

      self.on("message", function(addonMessage) {
        var callbackId = addonMessage.callbackId;
        var callback = callbacks[callbackId];
        if (!callback) {
          console.log("ContentMessaging: error can't find callback for callbackId="+callbackId);
          return;
        }
        callback(addonMessage.message);
        delete callbacks[callbackId];
      });

      addChromeMessageListener = function(callback) {
      //    chrome.extension.onMessage.addListener(callback);
      }

      messageToChrome = function(message, callback) {
        callback = callback || function() {};
        var callbackId = getCallbackId();
        var messageWrapper = { message: message, callbackId: callbackId };
        callbacks[callbackId] = callback;
        self.postMessage(messageWrapper);
        console.log('self.postMessaged to chrome: ', JSON.stringify(message));
      }

      // listen to page
      // TODO: refactor this magic string
      const RESOURCE_ORIGIN = 'resource://jid1-ueqrmxmswk4fra-at-jetpack';
      document.defaultView.addEventListener('message', function(event) {
        console.log('got event from: ', event.origin, ' was: ', event.data);
        if (event.origin !== RESOURCE_ORIGIN) return;
        var data = JSON.parse(event.data),
            callbackId;
        if (data.fromPage) { // only respond to messages from the page, not to the responses sent below
          console.log("ContentMessaging: message from page: "+event.data);
          callbackId = data.callbackId;
          messageToChrome(data.message, function(response) {
            document.defaultView.postMessage(JSON.stringify({ message: response, callbackId: callbackId }), RESOURCE_ORIGIN);
          });
        }
      });
    })();
  }
  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};
