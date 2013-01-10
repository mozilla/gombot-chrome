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
    User.firstRun.setIfCompleted(false);
}

function closeFirstRunTab() {
	chrome.tabs.remove(firstRunTab);
	firstRunTab = -1;
}