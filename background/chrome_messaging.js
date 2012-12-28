var ChromeMessaging = function() {

  function addContentMessageListener(callback) {
    chrome.extension.onMessage.addListener(callback);
  }

  function messageToContent(target, message) {
		chrome.tabs.sendMessage(target.tab.id, message);
  }

  return {
    addContentMessageListener: addContentMessageListener,
    messageToContent: messageToContent
  };
};