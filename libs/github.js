/*
* Github.js
* Copyright(c) 2013 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
*/

var https_module = require('https');
var qs_module = require('querystring');
var url_module = require('url');

var uris = module.exports.uris = {
	host : 'api.github.com',
	authorization : 'https://github.com/login/oauth/authorize',
	access : 'https://github.com/login/oauth/access_token'
}

var Github = module.exports.Github = function Github (client_id, client_secret) {
	this._client_id = client_id;
	this._client_secret = client_secret;
};

Github.prototype._client_id = null;
Github.prototype._client_secret = null;
Github.prototype.token = null;

/**
 *
 * perform an api call.
 * if options is a string, a HTTP GET request is made with options as the pathname. 
 * Otherwise you can use standard http module request parameters. 
 *
 * Any post data should be included via options.params
 * 
 * options.path
 * options.params
 * 
 * @param  {[type]}   options  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Github.prototype.call = function (options, callback) {

	if (typeof options === "string") {
		var pathname = options;
		options = url_module.parse(uris.host);
		options.path = pathname;
	}

	if (typeof options.host != "string") {
		options.host = uris.host;
	}

	if (typeof options.query != "object") {
		options.query = {};
	}

	if (typeof options.headers != "object") {
		options.headers = {};
	}

	if (typeof options.method != "string") {
		options.method = 'GET';
	}

	options.query.access_token = this.token;
	options.headers.accept = 'application/vnd.github.v3.raw+json';

	if (options.method === 'GET' && typeof options.query === 'object') {
		options.path += '?' + qs_module.stringify(options.query);
	}

	var request = https_module.request(options, function (res) {
		var buffer = '';

		res.on('data', function (data) {
			buffer += data;
		});

		res.on('end', function () {
			callback(null, JSON.parse(buffer));
		});
	});

	if (options.method != 'GET' && typeof options.query === 'object') {
		request.write(qs_module.stringify(options.query));
	}

	request.end();

	request.on('error', function (err) {
		callback(err);
	});
};

/**
 * build the authorization url
 * 
 * @param  {[type]} redirect_uri [description]
 * @param  {[type]} scope        [description]
 * @param  {[type]} state        [description]
 * @return {[type]}              [description]
 */
Github.prototype.buildAuthUrl = function (redirect_uri, scope, state) {
	var params = {
		client_id : this._client_id
	};

	if (redirect_uri) {
		params.redirect_uri = redirect_uri;
	}

	if (scope) {
		params.scope = scope;
	}

	if (state) {
		params.state = state;
	}

	if (Array.isArray(params.scope)) {
		params.scope = params.scope.join(' ');
	}

	return uris.authorization + '?' + qs_module.stringify(params);
};

/**
 * exchange an authorization code for an access token
 * 
 * @param  {[type]}   code     [description]
 * @param  {[type]}   state    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Github.prototype.accessToken = function (code, state, callback) {
	if (!callback) {
		callback = state;
		state = null;
	}

	var params = {
		client_id : this._client_id,
		//redirect_uri : '',
		client_secret : this._client_secret,
		code : code
	};

	if (state) {
		params.state = state;
	}

	var options = url_module.parse(uris.access);

	options.port = 443;
	options.method = 'POST';

	var request = https_module.request(options, function (res) {
		var buffer = '';

		res.on('data', function (data) {
			buffer += data;
		});

		res.on('end', function () {
			callback(null, qs_module.parse(buffer));
		});
	});

	request.write(qs_module.stringify(params));
	request.end();

	request.on('error', function (err) {
		callback(err);
	});
}
