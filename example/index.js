var url_module = require('url');
var http_module = require('http');

var Github = require('../index').Github;
var config = require('./config');

var lib = new Github(config.identifier, config.secret);

var server = http_module.createServer(function (req, res) {
	var url = url_module.parse(req.url, true);

	if (url.pathname == "/callback") {
		var code = url.query.code;

		lib.accessToken(code, function (err, token) {
			if (err) {
				console.log(err);
				throw err;
			}

			lib.token = token.access_token;

			res.writeHead(301, {
				location : '/'
			});

			res.end();
		});
	} else {
		if (lib.token) {
			lib.call('/repos/dashron/Github.js', function (err, issues) {
				if (err) {
					throw err;
				}

				console.log(issues);
				res.end(JSON.stringify(issues));
			});
		} else {
			res.end('<a href="' + lib.buildAuthUrl('http://localhost:8080/callback', ['repo']) + '">Link to Github</a>');
		}
	}
});

server.listen(8080, function () {
	console.log('Server listening  on port: 8080');
});