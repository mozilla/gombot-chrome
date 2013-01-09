var CapturedCredentialStorage = function(Realms) {

	var storage = {};

	function mergeCredentials(newCredentials, source) {
		var oldCredentials = storage[source.id];
		if (!oldCredentials || newCredentials.realm !== oldCredentials.realm) {
			storage[source.id] = newCredentials;
			return;
		}
		if (newCredentials.password) {
			oldCredentials.password = newCredentials.password;
		}
		if (newCredentials.username) {
			oldCredentials.username = newCredentials.username;
		}
	}


	// Stores captured credentials
	// Input:
	//   credentials: object with properties:
	//     usernames: An array of { <name>: <username> } key/value pairs. The <name> is a
	//                descriptive name for the <username>. In the common case where there is a
	//	              single username, the <name> will often be "username".
	//     password: a password
	//     id: identifier for the credentials
	//   source: object with properties:
	//     id: identifier for the credential's source
	//     url: url of the credential's source
	function setCredentials(credentials, source) {
		credentials.domain = new Uri(source.url).host();
		credentials.realm = Realms.getRealm(credentials.domain);
		mergeCredentials(credentials, source);
		console.log("Storing credentials", storage[source.id]);
	}

	function getCrendentials(credentials, source, callback) {
		callback(storage[source.id]);
		console.log("Getting credentials", storage[source.id]);
	}

	function deleteCredentials(source) {
		console.log("Deleting credentials for tab", source.id)
		delete storage[source.id]
	}

	return {
		setCredentials: setCredentials,
		getCredentials: getCrendentials,
		deleteCredentials: deleteCredentials
	};
};