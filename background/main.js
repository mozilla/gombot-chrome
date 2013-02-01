// const dataDir = require("self").data;
//
//
// var tbb = require("toolbarbutton").ToolbarButton({
//   id: "GOMBOT_TBB",
//   // label: "TBB TEST",
//   image: dataDir.url('gombot_logo-19x19.png'),
//   panel: testPanel,
//   onCommand: function () {
//   tbb.destroy(); // kills the toolbar button
//   }
// });

var self = require("self");
var tppanel = require("./lib/tppanel").Panel;
var panel = require('panel').Panel;

var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

exports.main = function(options, callbacks) {
  addToolbarButton();
};

/** Setup add Gombot button to all windows **/

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

/** Load all Gombot modules **/

var gombotModules = {
  Backbone: require("./lib/backbone"),
  _ : require("./lib/underscore"),
  Messaging: require("./messaging"),
  LocalStorage: require("./local_storage"),
  Tld: require("./lib/tld.js"),
  Uri: require("./lib/jsuri"),
  TldService: require("./tld_service"),
  SiteConfigs: require("./site_configs"),
  Realms: require("./realms"),
  Storage: require("./storage"),
  GombotClient: require("./client/client"),
  GombotSync: require("./gombot_sync"),
  LoginCredential: require("./models/login_credential"),
  LoginCredentialCollection: require("./collections/login_credential_collection"),
  CapturedCredentialStorage: require("./captured_credential_storage"),
  Linker: require("./linker"),
  CommandHandler: require("./command_handler"),
  User: require("./models/user"),
  UserCollection: require("./collections/user_collection"),
  AccountManager: require("./account_manager"),
  Pages: require("./pages")
};

var Gombot = require("./gombot")(gombotModules);


/** pageMod code for password form detection and filling **/

var pageMod = require("page-mod");

var contentScripts = [self.data.url("lib/jquery.js"),
            self.data.url("lib/underscore.js"),
            self.data.url("content_scripts/content_messaging.js"),
            self.data.url("content_scripts/dom_monitor.js"),
            self.data.url("content_scripts/password_form.js"),
            self.data.url("content_scripts/password_form_inspector.js"),
            self.data.url("content_scripts/main.js")];

/** Tpp panel stuff **/

pageMod.PageMod({
  include: "*",
  contentScriptFile: contentScripts,
  attachTo: ["top", "frame", "existing"],
  onAttach: function(worker) {
    Gombot.Messaging.registerPageModWorker(worker);
  }
});

var testPanel = (function() {
  var _panel = null;
  function createPanel() {
    _panel = panel({
      width:  300,
      height: 300,
      contentURL: self.data.url('browser_action/browser_action.html'),
      contentScriptFile: [ self.data.url("resource_content_scripts/content_messaging.js"),
                           self.data.url("resource_content_scripts/main.js") ]
    });
    Gombot.Messaging.registerPageModWorker(_panel);
    _panel.on('hide', function() {
      // Chrome initializes the page inside of a browser action each time it is clicked,
      // while Firefox lets the page inside of a panel persist. For now, let's kill the panel
      // every time it's hidden, and recreate it whenever the user clicks on the Gombot button.
      _panel.destroy();
      _panel = null;
    })
  }
  return {
    show: function(target) {
      if (!_panel) {
        createPanel();
      }
      // _panel.show();
      _panel.show(target);
    }
  }
})();

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
    testPanel.show(btn);
  }, false)
  navBar.appendChild(btn);
}
