'use strict';

var myImports = require('./headers.js');

const Hapi = myImports.Hapi;
const server = myImports.server;

var plugins = [
    {
        register: require('hapi-auth-cookie')
    },
    {
        register: require('hapi-authorization'),
        options: {
            roles: ['ADMIN', 'USER', 'EMPLOYEE'] // Can also reference a function which returns an array of roles
        }
    }
];

let uuid = 1;       // Use seq instead of proper unique identifiers for demo only

const users = {
    john: {
        id: 'john',
        password: 'password',
        name: 'John Doe',
        role: 'ADMIN'
    },
    sam: {
        id: 'sam',
        password: 'password',
        name: 'Sam Roy',
        role: 'USER'
    }
};

const home = function (request, reply) {

    reply('<html><head><title>Home page</title></head><body><h3>Welcome ' +
      request.auth.credentials.username.name +
      '!</h3><br/><form method="get" action="/logout">' +
      '<input type="submit" value="Logout">' +
      '</form></body></html>');
};

const login = function (request, reply) {

    if (request.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    let message = '';
    let account = null;
    let role = null;

    if (request.method === 'post') {

        if (!request.payload.username ||
            !request.payload.password) {

            message = 'Missing username or password';
        }
        else {
            account = users[request.payload.username];
            role = users[request.payload.username].role;
            if (!account ||
                account.password !== request.payload.password) {

                message = 'Invalid username or password';
            }
        }
    }

    if (request.method === 'get' ||
        message) {

        request.cookieAuth.clear();
        return reply('<html><head><title>Login page</title></head><body>' +
            (message ? '<h3>' + message + '</h3><br/>' : '') +
            '<form method="post" action="/login">' +
            'Username: <input type="text" name="username"><br>' +
            'Password: <input type="password" name="password"><br/>' +
            '<input type="submit" value="Login"></form></body></html>');
    }

    const sid = String(++uuid);
    request.server.app.cache.set(sid, { account: account, role: role }, 0, (err) => {

        if (err) {
            reply(err);
        }
        
        request.cookieAuth.set({ sid: sid });
        return reply.redirect('/');
    });
};

const logout = function (request, reply) {

    request.cookieAuth.clear();
    return reply.redirect('/');
};

server.register(plugins, (err) => {

    if (err) {
        throw err;
    }

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', true, {
        password: 'password-should-be-32-characters',
        cookie: 'session-id',
        redirectTo: '/login',
        domain: server.info.host,
        ttl: 60 * 60 * 1000, // Set session to 1 hour
        isSecure: false,
        validateFunc: function (request, session, callback) {
            cache.get(session.sid, (err, cached) => {

                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }
                return callback(null, true, {username: cached.account, role: cached.role});
            });
        }
    });

    server.route([
        { method: 'GET', path: '/', config: { handler: home , plugins: {'hapiAuthorization': {role: 'ADMIN'}}} },
        { method: ['GET', 'POST'], path: '/login', config: { handler: login, auth: { mode: 'try' }, plugins: { 'hapi-auth-cookie': { redirectTo: false } } } },
        { method: 'GET', path: '/logout', config: { handler: logout } }
    ]);

});

server.ext('onPreResponse', (request, reply) => {

    if (request.response.isBoom) {
        const err = request.response;
        const errName = err.output.payload.error;
        const statusCode = err.output.payload.statusCode;
        const message = err.output.payload.message;
        if(statusCode === 403){
            console.log(err.output.payload);
            return reply('<html><head><title>Home page</title></head><body><h3>Error = ' + message +
            '</h3><br/><form method="get" action="/logout">' +
                  '<input type="submit" value="Logout">' +
                  '</form></body></html>');
        }
    }

    reply.continue();
});

exports = module.exports = {};
exports.server = server;
