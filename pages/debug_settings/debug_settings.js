/*
*   debug_settings.js
*
*
*   Code for a throwaway page that dumps what's been saved in localStorage (see storage.js) and
*   makes it editable. Handy for debugging.
*
*/


$(document).ready(function() {
    // Dump out all stored data, and make editable
    chrome.storage.local.get(function(storedData) {
        for (var item in storedData) {
            var newEl = $("<div></div>");
            newEl.addClass('storagekey');
            newEl.attr('data-storagekey',item);
            var saveButton = $("<button>Save</button>");
            newEl.append("<h2>" + item + "</h2>");
            newEl.append("<textarea>" + JSON.stringify(storedData[item]) + "</textarea><br/>");
            saveButton.addClass('btn').addClass('btn-primary').addClass('save-button');
            newEl.append(saveButton);
            $(document.body).append(newEl);   
        }
        $('.save-button').click(function() { 
            var storageKeyDiv = $(this).parent('.storagekey');
            var parsedObj = JSON.parse(storageKeyDiv.find('textarea').val());
            // Save textarea content to localStorage
            var storageObj = {};
            storageObj[storageKeyDiv.attr('data-storagekey')] = parsedObj;
            chrome.storage.local.set(storageObj);
            console.log(storageKeyDiv.get()[0]);
        });
    });
});