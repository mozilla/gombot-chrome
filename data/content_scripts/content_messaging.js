var ContentMessaging = function() {

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
    console.log("ContentMessaging: found callback for callbackId="+callbackId);
    callback(addonMessage.message);
    delete callbacks[callbackId];
  });

  function addChromeMessageListener(callback) {
  //    chrome.extension.onMessage.addListener(callback);
  }

  function messageToChrome(message, callback) {
    callback = callback || function() {};
    console.log("messageToChrome", JSON.stringify(message), callback);
    var callbackId = getCallbackId();
    var messageWrapper = { message: message, callbackId: callbackId };
    callbacks[callbackId] = callback;
    self.postMessage(messageWrapper);
  }

  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};