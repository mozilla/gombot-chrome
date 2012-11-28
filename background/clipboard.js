/*
*   clipboard.js
*
*
*   This file just exists to manipulate the clipboard-sandbox <textarea> on the background page, 
*   so that we can copy a string onto the system clipboard.
*
*/


function copyToClipboard(str) {
    var sandbox = $('#clipboard-sandbox').val(str).select();
    document.execCommand('copy');
    sandbox.val('');
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'copy_clipboard') {
        copyToClipboard(request.str);
    }
});