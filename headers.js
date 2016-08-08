'use strict'

const Hapi = require('hapi');
const Dogwater = require('dogwater');
const SQLadapter = require("waterline-sqlserver");

const server = new Hapi.Server({
    cache: [
        {
            name: 'redisCache',
            engine: require('catbox-redis'),
            host: '127.0.0.1',
            partition: 'cache'
        }
    ]
});

server.connection({host: 'myserver.com', address: '192.168.2.161', port: 4000 });

exports = module.exports = {};
exports.Hapi = Hapi;
exports.Dogwater = Dogwater;
exports.SQLadapter = SQLadapter;
exports.server = server;

