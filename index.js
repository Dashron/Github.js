module.exports.Github = require('./libs/github').Github;

/**
 * should be provided an object. The default is {
 * 	host : 'api.github.com',
 * 	authorization : 'https://github.com/login/oauth/authorize',
 * 	access : 'https://github.com/login/oauth/access_token'
 * }
 * @param {[type]} uris [description]
 */
module.exports.setUris = function (uris) {
	require('./libs/github').uris = uris;
}