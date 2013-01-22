var FirefoxMessaging = function() {

  var commandHandlerCallback = null;

  // callback is expected to be of the form: function
  // Format: { request: { message: <message data> },
  //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
  //           sendResponse: callback function with single parameter to respond to content scripts }
  function addContentMessageListener(callback) {
    commandHandlerCallback = callback;
  }

  // TODO
  function messageToContent(target, message) {

  }

  function registerPageModWorker(worker) {
    // Firefox messages from content scripts should be like:
    // { callbackId: <callbackId>, // This is a callback identifer for the content script to invoke when this returns
    //      message: <actual message data>
    // }
    worker.on('message', function (message) {
      var request = message.message,
          sender = { tab: { id: "", url: worker.url } },
          sendResponse = function(response) {
            worker.postMessage({ callbackId: message.callbackId, message: response });
          };
      commandHandlerCallback(request, sender, sendResponse);
    });
  }

  return {
    registerPageModWorker: registerPageModWorker,
    addContentMessageListener: addContentMessageListener,
    messageToContent: messageToContent
  };
};

module.exports = FirefoxMessaging;