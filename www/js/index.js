var config = {
	access_token	: '',
	refresh_token 	: '',
	user_id			: 0,
	login_url		: 'http://speeltuin.kw.nl/~pike/pgb-oauth/login.php',
	reconnect_url	: 'http://speeltuin.kw.nl/~pike/pgb-oauth/reconnect.json.php'
}

$(document).on('deviceready', function() {
	$('#login-button').on('click',oaLogin);
	$('#logout-button').on('click',oaLogout);
	$('#reconnect-button').on('click',oaReconnect);
	pgInit();
});

function pgInit() {
	status('init..');
	// read stuff from localstorage
	if (config.access_token) {
		// you were here before. refresh.
		status('reconnecting..');
		reconnect();
	} else {
		status('first launch.');
	}
}

function pgStatus(msg) {
	$('#login-access-token').txt(config.access_token);
	$('#login-refresh-token').txt(config.refresh_token);
	$('#login-user-id').txt(config.user_id);
	$('#login-status').txt(msg);
}


function oaLogin() {

	//Open the OAuth consent page in the InAppBrowser
	var wdw = window.open(config.login_url, '_blank', 'location=no,toolbar=no');

	$(wdw).on('loadstart', function(e) {
		var url = e.originalEvent.url;
		var success = /\/success.php/.exec(url);
		var error = /\/error.php/.exec(url);
		
		if (success || error) {
			//Always close the browser when match is found
			wdw.close();
		}
		
		if (success) {
			config.access_token = /access_token=([^&]+)/.exec(url)[0];
			config.refresh_token = /refresh_token=([^&]+)/.exec(url)[0];
			config.user_id = /user_id=([^&]+)/.exec(url)[0];
			status('Logged in.');
			$('#login-button').hide();
			$('#logout-button,#reconnect-button').show();
		
		}
		if (error) {
			var message = /message=([&]+)/.exec(url);
			status('Error logging in: '+messages.join('<br>');
		}		
	}
} 


function oaReconnect() {
	$.post(config.reconnect_url, {
		access_token	: config.access_token,
		refresh_token	: config.refresh_token
	}).done(function(data) {
		if (!data.error) {
			config.access_token = data.result.access_token;
			config.refresh_token = data.result.refresh_token;
			status('Reconnected');
		} else {
			status('Reconnect failed!');
			$('#login-button').show();
			$('#logout-button,#reconnect-button').hide();
		}
	}).fail(function(response) {
		status(response.responseJSON.error);
	});
}

function oaLogout() {
	config.access_token='';
	config.refresh_token='';
	config.user_id=0;
	// you probably want to do things remote, too
	status('Logged out');
	$('#login-button').show();
	$('#logout-button,#reconnect-button').hide();
}


