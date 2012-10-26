// Maps popup IDs to callback functions
var callbackMap = {};
var lastPopupID = 0;

function promptUserForPIN(prompt,repeat,callback) {
    // var notif = webkitNotifications.createHTMLNotification('data/pin_entry.html');
    // notif.show();
    chrome.windows.create({
        url: 'data/pin_entry.html',
        type: 'popup',
        width: 300,
        height: 300,
        top: screen.height/2 - 300/2,
        left: screen.width/2 - 300/2
    }, function(win) {
        var tabID = win.tabs[0].id;
        console.log('tabid: ' + tabID);
        console.log(win);
        
        chrome.tabs.executeScript(tabID, {file: "pin_entry_content_script.js"});
        
        // Wait a beat for the page to load.
        setTimeout(function() { 
            callbackMap[lastPopupID] = {
                'callback': callback,
                'tab_id': tabID
            };
            
            chrome.tabs.sendMessage(tabID, {
                type: 'set_callbackid',
                callback_id: lastPopupID++
            });
            
            chrome.tabs.sendMessage(tabID,{
                type: 'set_prompt',
                prompt: prompt,
                repeat: repeat
            });
        },1);
    });
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'submit_pin') {
        chrome.tabs.remove(callbackMap[request.callback_id].tab_id);
        var callbackFunc = callbackMap[request.callback_id].callback;
        if (callbackFunc === undefined) return;
        callbackFunc(request.pin);
    }
});

// promptUserForPIN('test test!',true, function(PIN) {
//     console.log('got PIN ', PIN);
// });