
// Include jquery and Persona
// Thanks, http://coding.smashingmagazine.com/2010/05/23/make-your-own-bookmarklets-with-jquery/
(function(){

    var libsLoaded = {
        'jquery': false,
        'persona': false
    };
    
    function initIfReady() {
        for (var lib in libsLoaded) {
            if (!libsLoaded[lib]) return;
        }
        initSkyCrane();
        // navigator.id.request();
        appendPersonaButton();
    }
    
    function loadScript(libName,scriptURL) {
		var script = document.createElement("script");
		script.src = scriptURL;
		script.onload = script.onreadystatechange = function(){
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                libsLoaded[libName] = true;
				initIfReady();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);        
    }

	// the minimum version of jQuery we want
	var v = "1.3.2";

	// check prior inclusion and version
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		loadScript("jquery","http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js");
	} else {
        libsLoaded.jquery = true;
		initIfReady();
	}
    
    if (navigator.id === undefined) {
        loadScript("persona","https://login.persona.org/include.js");
    } else {
        libsLoaded.persona = true;
		initIfReady();
    }
	
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
    
    function appendPersonaButton() {
        var personaButton = $('<input type="submit" value="Login with Persona"/>');
        personaButton.click(function() {
            navigator.id.request();
        });
        $(document.body).append(personaButton);
    }

})();