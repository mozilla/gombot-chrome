//javascript:(function(){if(window.myBookmarklet!==undefined){myBookmarklet();}else{document.body.appendChild(document.createElement('script')).src='http://localhost:8000/public/bookmarklet.js';}})();
function initSkyCrane() {
    $.ajax({
        url: "http://localhost:8000/get_login/" + window.location.host,
        dataType: 'json',
        success: function(data) {
            var usernameFieldName = data.data.usernameField.name;
            var passwordFieldName = data.data.passwordField.name;
            
            $('input[name="' + usernameFieldName + '"]').val(data.data.username);
            $('input[name="' + passwordFieldName + '"]').val(data.data.password);
        }
    });
}

// Thanks, http://coding.smashingmagazine.com/2010/05/23/make-your-own-bookmarklets-with-jquery/
(function(){

	// the minimum version of jQuery we want
	var v = "1.3.2";

	// check prior inclusion and version
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false;
		var script = document.createElement("script");
		script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initSkyCrane();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		initSkyCrane();
	}
	

})();