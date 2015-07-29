var config = {
	emulate			: false, // call with ? emulate to emulate
	access_token	: '',
	refresh_token 	: '',
	user_id			: 0,
	login_url		: 'http://speeltuin.kw.nl/~pike/pgb-oauth-web/login.php',
	reconnect_url	: 'http://speeltuin.kw.nl/~pike/pgb-oauth-web/reconnect.json.php',
	logout_url		: 'http://speeltuin.kw.nl/~pike/pgb-oauth-web/logout.json.php'
}

$(document).on('deviceready', function() {
	uiInit();
});

function uiInit() {
	uiStatus('init..');
	$('#login-button').on('click',oaLogin);
	$('#logout-button').on('click',oaLogout);
	$('#reconnect-button').on('click',oaReconnect);
	
	// read stuff from localstorage
	if (config.access_token) {
		// you were here before. refresh.
		uiStatus('reconnecting..');
		reconnect();
	} else {
		uiStatus('first launch.');
	}
}

function uiStatus(msg) {
	$('#login-access-token').text('ACCESS:'+config.access_token);
	$('#login-refresh-token').text('REFRESH:'+config.refresh_token);
	$('#login-user-id').text('USERID:'+config.user_id);
	$('#login-status').text(msg);
}

function uiLoggedIn(msg,access_token,refresh_token,user_id) {
	config.access_token 	= access_token;
	config.refresh_token 	= refresh_token;
	config.user_id 			= user_id;
	uiStatus(msg);
	$('#login-button').hide();
	$('#logout-button,#reconnect-button').show();
}

function uiLoggedOut(msg) {
	uiStatus(msg);
	$('#login-button').show();
	$('#logout-button,#reconnect-button').hide();
}


function oaLogin() {	

	uiStatus('Logging in ..');

	//Open the OAuth consent page in the InAppBrowser
	var wdw = window.open(config.login_url, '_blank', 'location=no,toolbar=no');

	// use a timer to check network issues
	
	$(wdw).on('loadstart', function(e) {
		var url = e.originalEvent.url;
		var success = /\/success.php/.exec(url);
		var error = /\/error.php/.exec(url);
		
		if (success || error) {
			//Always close the browser when match is found
			wdw.close();
		}
		
		if (success) {
			var access_token = /access_token=([^&]+)/.exec(url)[1];
			var refresh_token = /refresh_token=([^&]+)/.exec(url)[1];
			var user_id = /user_id=([^&]+)/.exec(url)[1];
			uiLoggedIn('Logged in.',access_token,refresh_token,user_id);
		}
		if (error) {
			var message = /message=([&]+)/.exec(url);
			uiLoggedOut('Error logging in: '+messages.join('<br>'));
		}		
	});
} 


function oaReconnect() {
	uiStatus('Reconnecting ..');
	$.post(config.reconnect_url, {
		access_token	: config.access_token,
		refresh_token	: config.refresh_token
	}).done(function(data) {
		if (!data.error) {
			var access_token = data.result.access_token;
			var refresh_token = data.result.refresh_token;
			var user_id = data.result.user_id;
			uiLoggedIn('Reconnected.',access_token,refresh_token,user_id);
		} else {
			uiLoggedOut('Reconnect failed:',data.messages);
		}
	}).fail(function(response) {
		uiStatus(response.responseJSON.error);
	});
}

function oaLogout() {
	uiStatus('Reconnecting ..');
	$.post(config.logout_url,{}).done(function(data) {
		if (!data.error) {
			config.access_token='';
			config.refresh_token='';
			config.user_id=0;
			uiLoggedOut('Logged out');
		} else {
			uiStatus('Logout failed:',data.messages);
		}
	}).fail(function(response) {
		uiStatus(response.responseJSON.error);
	});
}

