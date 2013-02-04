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

var GombotModules = require("./modules");
var Gombot = require("./gombot")(GombotModules);
Gombot.init();

/** Tpp panel stuff **/

// var testPanel = require('panel').Panel({
//   url: self.data.url('testpanel.html')
// });
var tppanel = require("./lib/tppanel").Panel;

var testPanel = tppanel({
    width:  300,
    height: 300,
    contentURL: self.data.url('testpanel.html'),
    //onHide:  function(evt){mypanel.show()}
});

/** pageMod code for password form detection and filling **/

var pageMod = require("page-mod");

var contentScripts = [self.data.url("lib/jquery.js"),
                      self.data.url("lib/underscore.js"),
                      self.data.url("content_scripts/content_messaging.js"),
                      self.data.url("content_scripts/dom_monitor.js"),
                      self.data.url("content_scripts/password_form.js"),
                      self.data.url("content_scripts/password_form_inspector.js"),
                      self.data.url("content_scripts/main.js")];

pageMod.PageMod({
  include: "*",
  contentScriptFile: contentScripts,
  attachTo: ["top", "frame", "existing"],
  onAttach: function(worker) {
    Gombot.Messaging.registerPageModWorker(worker);
  }
});

exports.gombot = Gombot;
