var Pages = function(Gombot) {

  const PAGES_PATH="pages/first_run/";

  if (typeof chrome === "undefined") {
    // define a pageMod for resource urls
    var pageMod = require("page-mod");
    var self = require("self");
    // Makes something like this: 'resource://jid1-ueqrmxmswk4fra-at-jetpack/*'
    var resourceUrlsPattern = self.data.url("").split("/").slice(0,3).join("/")+"/*";
    pageMod.PageMod({
      include: [ resourceUrlsPattern ],
      contentScriptFile: [ self.data.url("resource_content_scripts/content_messaging.js"),
                           self.data.url("resource_content_scripts/main.js") ],
      onAttach: function(worker) {
        Gombot.Messaging.registerPageModWorker(worker);
      }
    });
  }

  function constructUrl(resource) {
    var url;
    if (typeof chrome !== 'undefined') {
      url = "../data/"+PAGES_PATH+resource+".html";
    }
    else { // Firefox
      var self = require("self");
      url = self.data.url(PAGES_PATH+resource+".html");
    }
    return url;
  }

  // Navigates the source to the given resource. If the source is null,
  // then it will load the resource in a new tab.
  function navigateTo(resource, source) {
    var url = constructUrl(resource);
    if (typeof chrome !== 'undefined') {
      if (!source) chrome.tabs.create({ url: url });
      else chrome.tabs.update(source.tab.id, { url: url });
    }
    else { // Firefox
      var self = require("self");
      if (!source) require('tabs').open({ url: url });
      else source.tab.tab.url = url; // Change the tab on the Jetpack tab obj
    }
  }

  return {
    navigateTo: navigateTo
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Pages;
}

