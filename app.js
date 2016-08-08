'use strict'

var myImports = require('./routes.js');
const server = myImports.server;

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
    console.log(`Server running at: ${server.info.host}`);
});

