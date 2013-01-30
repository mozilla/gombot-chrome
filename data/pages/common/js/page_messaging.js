var PageMessaging = function() {

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

      var pageOrigin = window.location.protocol+"//"+window.location.hostname+"/";

      function getCallbackId() {
        idCounter += 1;
        return "page-"+idCounter;
      }

      function messageHandler(addonMessage) {
        var callbackId = addonMessage.callbackId;
        var callback = callbacks[callbackId];
        if (!callback) {
          console.log("ContentMessaging: error can't find callback for callbackId="+callbackId);
          return;
        }
        callback(addonMessage.message);
        delete callbacks[callbackId];
      }

      window.addEventListener("message", function(event) {
        console.log(event);
        var data = JSON.parse(event.data);
        if (data.fromPage) return;
        messageHandler(data);
      }, false);

      addChromeMessageListener = function(callback) {
      //    chrome.extension.onMessage.addListener(callback);
      }

      messageToChrome = function(message, callback) {
        callback = callback || function() {};
        var callbackId = getCallbackId();
        var messageWrapper = { message: message, callbackId: callbackId, fromPage: true };
        callbacks[callbackId] = callback;
        dump("PageMessaging.messageToChrome: "+JSON.stringify(messageWrapper), "\n\n");
        document.defaultView.postMessage(JSON.stringify(messageWrapper), pageOrigin);
      }
    })();
  }
  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};
