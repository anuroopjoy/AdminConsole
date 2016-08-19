'use strict';

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _ArgumentError = require('./errors/ArgumentError');

var _ArgumentError2 = _interopRequireDefault(_ArgumentError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (options) {
  if (!options || !(options instanceof Object)) {
    throw new _ArgumentError2.default('The options must be an object.');
  }

  if (!options.clientId || options.clientId.length === 0) {
    throw new _ArgumentError2.default('The Auth0 Client ID has to be provided.');
  }

  if (!options.clientSecret || options.clientSecret.length === 0) {
    throw new _ArgumentError2.default('The Auth0 Client Secret has to be provided.');
  }

  if (!options.domain || options.domain.length === 0) {
    throw new _ArgumentError2.default('The Auth0 Domain has to be provided.');
  }

  var middleware = (0, _expressJwt2.default)({
    secret: new Buffer(options.clientSecret, 'base64'),
    audience: options.clientId,
    issuer: 'https://' + options.domain + '/'
  });

  return function (next) {
    return function (context, req) {
      middleware(req, null, function (err) {
        if (err) {
          context.res = {
            status: err.status || 500,
            body: {
              message: err.message
            }
          };

          return context.done();
        }

        return next(context, req);
      });
    };
  };
};