PopupNotifications.prototype._old_refreshPanel = PopupNotifications.prototype._refreshPanel;
PopupNotifications.prototype._refreshPanel = function(notificationsToShow) {
    console.log('in _refreshPanel');
    nonCustomNotifs = notificationsToShow.filter(function(x) { return x.id != "pin-prompt"; });
    this._old_refreshPanel.apply(this,[nonCustomNotifs]);
    
    for (var x = 0; x < notificationsToShow.length; x++) {
        if (notificationsToShow[x].id == 'pin-prompt') {
            const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
            var n = notificationsToShow[x];
            let doc = this.window.document;
            let popupnotification = doc.createElementNS(XUL_NS, "popupnotification");
            popupnotification.setAttribute("label", n.message);
            // Append "-notification" to the ID to try to avoid ID conflicts with other stuff
            // in the document.
            popupnotification.setAttribute("id", n.id + "-notification");
            popupnotification.setAttribute("popupid", n.id);
            popupnotification.setAttribute("closebuttoncommand", "PopupNotifications._dismiss();");
            if (n.mainAction) {
              popupnotification.setAttribute("buttonlabel", n.mainAction.label);
              popupnotification.setAttribute("buttonaccesskey", n.mainAction.accessKey);
              popupnotification.setAttribute("buttoncommand", "PopupNotifications._onButtonCommand(event);");
              popupnotification.setAttribute("menucommand", "PopupNotifications._onMenuCommand(event);");
              popupnotification.setAttribute("closeitemcommand", "PopupNotifications._dismiss();event.stopPropagation();");
            }
            if (n.options.popupIconURL)
              popupnotification.setAttribute("icon", n.options.popupIconURL);
            popupnotification.notification = n;

            if (n.secondaryActions) {
              n.secondaryActions.forEach(function (a) {
                let item = doc.createElementNS(XUL_NS, "menuitem");
                item.setAttribute("label", a.label);
                item.setAttribute("accesskey", a.accessKey);
                item.notification = n;
                item.action = a;

                popupnotification.appendChild(item);
              }, this);
              
              var testElem = doc.createElementNS(XUL_NS, "xul:button");
              testElem.value = "hello world!";
              popupnotification.appendChild(testElem);
              console.log ('doing custom _refresh');

              if (n.secondaryActions.length) {
                let closeItemSeparator = doc.createElementNS(XUL_NS, "menuseparator");
                popupnotification.appendChild(closeItemSeparator);
              }
            }
            
            this.panel.appendChild(popupnotification);
        }
    }
}
