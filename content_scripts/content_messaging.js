var ContentMessaging = function() {

  function addChromeMessageListener(callback) {
    chrome.extension.onMessage.addListener(callback);
  }

  function messageToChrome(message, callback) {
    callback = callback || function() {}; // chrome likes this to be something
		chrome.extension.sendMessage(message, callback);
  }

  return {
    addChromeMessageListener: addChromeMessageListener,
    messageToChrome: messageToChrome
  };
};