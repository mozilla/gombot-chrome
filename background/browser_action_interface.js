/*
*   browser_action_interface.js
*
*
*   These are some functions that allow the browserAction to get the state of the
*   browser (ie, which tab is currently active) and send messages to the observer
*   script running on that page.
*
*   Note that none of these functions check whether logins are PIN locked. In order
*   to keep with the current security model, you must prompt for a PIN before form
*   filling.
*
*/


function getActiveTab(callback) {
    // Taken from: http://code.google.com/p/pgn4web/issues/detail?id=110
    chrome.windows.getCurrent(function(win) { 
        chrome.tabs.query({
            'windowId': win.id,
            'active': true
        }, 
        function(tabArray) { 
            callback(tabArray[0]);
         });
     });
}

// This is called when the user has PIN authenticated in the browser action
// popup. Fills in the forms on the current page.
function formFillCurrentTab() {
    getActiveTab(function(tab) {
        formFillTab(tab);
    });
}

function getPageDataForPopup(callback) {
    getActiveTab(function(tab) {
        var newURL = new Uri(tab.url); 
        getLoginsForSite(newURL.host(),function(logins) {
            callback(logins);
        });
    });
}

function formFillTab(tab) {
    var newURL = new Uri(tab.url);
    getLoginsForSite(newURL.host(),function(logins) {
        chrome.tabs.sendMessage(tab.id,{
            type: 'fill_form',
            login: logins[0]
        });
    });
}