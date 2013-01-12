/*
* Github.js
* Copyright(c) 2013 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
*/

var https_module = require('https');
var qs_module = require('querystring');
var url_module = require('url');

var uris = module.exports.uris = {
	host : 'https://api.github.com',
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
 * options.hostname
 * options.pathname
 * options.query
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

	if (typeof options.query != "object") {
		options.query = {};
	}

	if (typeof options.headers != "object") {
		options.headers = {};
	}

	options.query.access_token = this.token;
	options.headers.accept = 'application/vnd.github.v3.raw+json';

	var request = https_module.request(options, function (res) {
		var buffer = '';

		res.on('data', function (data) {
			buffer += data;
		});

		res.on('end', function () {
			callback(null, JSON.parse(buffer));
		});
	});

	if (options.params) {
		request.write(qs_module.stringify(options.params));
	}

	request.end();

	request.on('error', function (err) {
		callback(err);
	});
};

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