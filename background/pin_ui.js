/*
*   pin_ui.js
*
*
*   Manages PIN entry in popup browser windows (code to do it in iframes is elsewhere, in browser_action.js).
*   Also manages callbacks.
*
*/

// Maps popup IDs to callback functions
var callbackMap = {};
var lastPopupID = 0;

function promptUserForPIN(prompt,repeat,callback) {
    console.log('promptUserForPIN');
    chrome.windows.create({
        url: '../common/pin_entry.html',
        type: 'popup',
        width: 300,
        height: 300,
        top: screen.height/2 - 300/2,
        left: screen.width/2 - 300/2
    }, function(win) {
        var tabID = win.tabs[0].id;
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

// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
//     console.log('What was sent: ',request);
//     if (request.type == 'submit_pin') {
//         // Callback ID will be missing if the call comes from inside of an iframe.
//         // In that case, the PIN entry was created outside of pin_ui.js, and we don't
//         // need to do any handling here.
//         // FIXME: callback_id is null inside of iframe
//         if (request.callback_id === undefined) return;
//         chrome.tabs.remove(callbackMap[request.callback_id].tab_id);
//         var callbackFunc = callbackMap[request.callback_id].callback;
//         if (callbackFunc === undefined) return;
//         callbackFunc(request.pin);
//     }
// });