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
	
	uiLoad();
	
	// read stuff from localstorage
	if (config.user_id) {
		// you were here before. refresh.
		uiStatus('previously connected.');
		oaReconnect();
	} else {
		uiStatus('first launch.');
	}
}

function uiLoad() {
	config.access_token 	= localStorage.getItem('access_token');
	config.refresh_token 	= localStorage.getItem('refresh_token');
	config.user_id 			= localStorage.getItem('user_id');
}

function uiSave() {
	localStorage.setItem('access_token',config.access_token);
	localStorage.setItem('refresh_token',config.refresh_token);
	localStorage.setItem('user_id',config.user_id);
}


function uiStatus(msg,error) {
	$('#login-access-token').text('ACCESS:'+config.access_token);
	$('#login-refresh-token').text('REFRESH:'+config.refresh_token);
	$('#login-user-id').text('USERID:'+config.user_id);
	$('#login-status').text(msg);
	$('#login-status').toggleClass('error',error?true:false);
}
function uiError(msg) {
	uiStatus(msg,true);
}

function uiLoggedIn(msg,access_token,refresh_token,user_id) {
	config.access_token 	= access_token;
	config.refresh_token 	= refresh_token;
	config.user_id 			= user_id;
	uiSave();
	uiStatus(msg);
	$('#login-button').hide();
	$('#logout-button,#reconnect-button').show();
}

function uiLoggedOut(msg,error) {
	config.access_token 	= '';
	config.refresh_token 	= '';
	config.user_id 			= 0;
	uiSave();
	uiStatus(msg,error);
	$('#login-button').show();
	$('#logout-button,#reconnect-button').hide();
}


function oaLogin() {	

	uiStatus('Logging in ..');

	//Open the OAuth consent page in the InAppBrowser
	var wdw = window.open(config.login_url, '_blank', 'location=no,toolbar=no');

	// use a timer to check network issues
	// this event is only triggered by the inAppBrowser
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
			uiLoggedOut('Error logging in: '+messages.join('<br>'),true);
		}		
	});
} 


function oaReconnect() {
	uiStatus('Reconnecting ..');
	$.post(config.reconnect_url, {
		access_token	: config.access_token,
		refresh_token	: config.refresh_token
	}).done(function(data) {
		var response = jQuery.parseJSON(data);
		if (response && !response.error) {
			var access_token = response.result.access_token;
			var refresh_token = response.result.refresh_token;
			var user_id = response.result.user_id;
			uiLoggedIn('Reconnected.',access_token,refresh_token,user_id);
		} else {
			uiLoggedOut('Reconnect failed: '+data, true);
		}
	}).fail(function(response) {
		uiError(response.responseJSON.error);
	});
}

function oaLogout() {
	uiStatus('Logging out ..');
	$.post(config.logout_url,{
		access_token	: config.access_token,
		refresh_token	: config.refresh_token
	}).done(function(data) {
		var response = jQuery.parseJSON(data);
		if (response && !response.error) {
			config.access_token='';
			config.refresh_token='';
			config.user_id=0;
			uiLoggedOut('Logged out');
		} else {
			uiStatus('Logout failed: '+data,true);
		}
	}).fail(function(response) {
		uiError(response.responseJSON.error);
	});
}

