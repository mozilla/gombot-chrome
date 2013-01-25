var ContentMessaging = function() {

  var addChromeMessageListener,
      messageToChrome;

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
      }
    })();
  }
  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};
