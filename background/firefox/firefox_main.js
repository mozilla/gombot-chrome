// const dataDir = require("self").data;
//
//
// var tbb = require("toolbarbutton").ToolbarButton({
//   id: "GOMBOT_TBB",
//   // label: "TBB TEST",
//   image: dataDir.url('gombot_logo-19x19.png'),
//   panel: testPanel,
//   onCommand: function () {
//     tbb.destroy(); // kills the toolbar button
//   }
// });

var self = require("self");
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
var tppanel = require("./tppanel").Panel;

exports.main = function(options, callbacks) {
  addToolbarButton();
  // other stuff
};

// var testPanel = require('panel').Panel({
//   url: self.data.url('testpanel.html')
// });

var testPanel = tppanel({
    width:  300,
    height: 300,
    contentURL: self.data.url('testpanel.html'),
    //onHide:  function(evt){mypanel.show()}
});

function addToolbarButton() {
  var document = mediator.getMostRecentWindow("navigator:browser").document;
  var navBar = document.getElementById("nav-bar");
  if (!navBar) {
      return;
  }
  var btn = document.createElement("toolbarbutton");

  btn.setAttribute('type', 'button');
  btn.setAttribute('class', 'toolbarbutton-1');
  btn.setAttribute('image', self.data.url('gombot_logo-19x19.png')); // path is relative to data folder
  btn.setAttribute('orient', 'horizontal');
  btn.setAttribute('label', 'My App');
  btn.addEventListener('click', function() {
      // console.log('clicked');
      testPanel.show(btn);
  }, false)
  navBar.appendChild(btn);
}

var windows = require("windows").browserWindows;
windows.on('open', function(window) {
  addToolbarButton();
});

var gombotModules = {
  Backbone: require("../lib/backbone"),
  _ : require("../lib/underscore"),
  Messaging: require("./firefox_messaging"),
  LocalStorage: require("./firefox_local_storage"),
  Tld: require("./tld.js"),
  Uri: require("../lib/jsuri"),
  TldService: require("../tld_service"),
  SiteConfigs: require("../site_configs"),
  Realms: require("../realms"),
  Storage: require("../storage"),
  GombotClient: require("../client/client"),
  GombotSync: require("../gombot_sync"),
  LoginCredential: require("../models/login_credential"),
  LoginCredentialCollection: require("../collections/login_credential_collection"),
  CapturedCredentialStorage: require("../captured_credential_storage"),
  Linker: require("../linker"),
  CommandHandler: require("../command_handler"),
  User: require("../models/user"),
  UserCollection: require("../collections/user_collection")
};

var Gombot = require("../gombot")(gombotModules);

var pageMod = require("page-mod");

var contentScripts = [self.data.url("lib/jquery.js"),
                      self.data.url("lib/underscore.js"),
                      self.data.url("content_scripts/content_messaging.js"),
                      self.data.url("content_scripts/shared/dom_monitor.js"),
                      self.data.url("content_scripts/shared/password_form.js"),
                      self.data.url("content_scripts/shared/password_form_inspector.js"),
                      self.data.url("content_scripts/shared/main.js")];

pageMod.PageMod({
  include: "*",
  contentScriptFile: contentScripts,
  attachTo: ["top", "frame", "existing"],
  onAttach: function(worker) {
    Gombot.Messaging.registerPageModWorker(worker);
  }
});

