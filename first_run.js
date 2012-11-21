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
	chrome.tabs.create({
        // url: 'data/first_run.html'
        url: 'data/splash.html'
	}, function(tab) {
		initFirstRunInTab(tab);
	})	
}

function initFirstRunInTab(tab) {
	firstRunTab = tab.id
}

function closeFirstRunTab() {
	chrome.tabs.remove(firstRunTab);
	firstRunTab = -1;
}