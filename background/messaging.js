var Messaging = function() {
  var addContentMessageListener,
      messageToContent,
      revealedModule = {};

  if (typeof chrome !== "undefined") { // Chrome specific messaging to content scripts
    // callback is expected to be of the form: function
    // Format: { request: { message: <message data> },
    //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
    //           sendResponse: callback function with single parameter to respond to content scripts }
    addContentMessageListener = function(callback) {
      chrome.extension.onMessage.addListener(callback);
    };

    messageToContent = function(target, message) {
      chrome.tabs.sendMessage(target.tab.id, message);
    };
  }
  else if (typeof require === "function") { // Firefox specific messaging to page mod workers
    (function() {
      var commandHandlerCallback = null;

      // callback is expected to be of the form: function
      // Format: { request: { message: <message data> },
      //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
      //           sendResponse: callback function with single parameter to respond to content scripts }
      addContentMessageListener = function(callback) {
        commandHandlerCallback = callback;
      }

      // TODO
      messageToContent = function(target, message) {

      }

      revealedModule.registerPageModWorker = function(worker) {
        // Firefox messages from content scripts should be like:
        // { callbackId: <callbackId>, // This is a callback identifer for the content script to invoke when this returns
        //      message: <actual message data>
        // }
        worker.on('message', function (message) {
          console.log("Message from pageMod: "+JSON.stringify(message));
          var request = message.message,
              // TODO: Jetpack doesn't seem to offer us a stable id for tabs, so we use the
              // index in its window for now. Maybe find something better in the future.
              sender = { tab: { id: worker.tab.index, url: worker.tab.url, tab: worker.tab } },
              sendResponse = function(response) {
                worker.postMessage({ callbackId: message.callbackId, message: response });
              };
          commandHandlerCallback(request, sender, sendResponse);
        });
      }
    })();
  }
  else {
    throw "Can't initialize Messaging. Can't find 'chrome' or 'require'.";
  }

  revealedModule.addContentMessageListener = addContentMessageListener;
  revealedModule.messageToContent = messageToContent;

  return revealedModule;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Messaging;
}

