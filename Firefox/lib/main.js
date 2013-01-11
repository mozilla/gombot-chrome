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

var data = require("self").data;
var {Cc, Ci} = require("chrome");
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

exports.main = function(options, callbacks) {
  addToolbarButton();
  // other stuff
};

var testPanel = require('panel').Panel({
  url: data.url('testpanel.html')
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
  btn.setAttribute('image', data.url('gombot_logo-19x19.png')); // path is relative to data folder
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