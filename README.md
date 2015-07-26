
	---------
   	PGB-OAUTH-APP 201507*pike
   	---------

	Oauth2 over Phonegap Build
   	
   	This is the app part of pgb-oauth. Most of the oauth
   	handling is done in the web part. 
	To connect to a remote service over oauth, a InAppBrowser
 	is launched that contains remote logic. The window is
	watched for success or error. On success, the tokens
	needed to reconnect are saved in the app.
	Any subsequent startups, the app tries to reconnect
	by passing those tokens to the online service. The
	online service then uses these keys to connect
	or refresh tokens.

