/*
*   first_run.js
*
*
*   Starts the first run/signup flow, and communicates with it from chrome code.
*
*/

var firstRunTab = -1;

function startFirstRunFlow() {
    // Show the splash screen in a new tab. Should point the user to click
    // on the browserAction.
	chrome.tabs.create({
        url: '../pages/first_run/create_account.html'
	}, function(tab) {
		firstRunTab = tab.id
	});
    // Updates the browserAction popup, stores that we haven't
    // yet completed first run in localStorage.
    setIfDidFirstRun(false);
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
