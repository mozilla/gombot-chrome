/*
*   first_run.js
*
*
*   Starts the first run/signup flow, and communicates with it from chrome code.
*
*/

var firstRunTab = -1;

function startFirstRunFlow() {
	// Ensure that only one first run tab is open at a time.
	if (firstRunTab != -1) return;
    // Show the splash screen in a new tab. Should point the user to click
    // on the browserAction.
	chrome.tabs.create({
        url: 'pages/first_run/index.html'
	}, function(tab) {
		initFirstRunInTab(tab);
	});
    // Set the browserAction popup to be the Gombot signup page.
    chrome.browserAction.setPopup({
        popup: "data/first_run.html"
    });
}

function initFirstRunInTab(tab) {
	firstRunTab = tab.id
}

function closeFirstRunTab() {
	chrome.tabs.remove(firstRunTab);
	firstRunTab = -1;
}

function firstRunFinished() {
    // Save the fact that the first run flow has been completed, 
    // so that the splash screen doesn't reopen the next time the 
    // add-on starts, and the regular interface appears in the browserAction.
    setIfDidFirstRun(true);
}
