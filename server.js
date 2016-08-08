'use strict'

var myImports = require('./headers.js');
require('./auth.js');
const Hapi = myImports.Hapi;
const Dogwater = myImports.Dogwater;
const SQLadapter = myImports.SQLadapter;
const server = myImports.server;


server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public',
                listing: false,
                index: true,
                lookupCompressed: true
            }
        }
    });
    
});

server.register({
    register: Dogwater,
    options: {
        adapters: {
            sqlserver: SQLadapter
        },
        connections: {
            simple: {
              adapter: 'sqlserver',
              database: 'FuzeDB',
              host: '192.168.2.204',
              port: 1433,
              user: 'sa',
              persistent: false,
              password: 'abc@123'
            }
        }
    }
}, (err) => {

        if (err) {
            throw err;
        }

        console.log("Connected to database successfully");
        // Define a model using a connection declared above
        server.dogwater({
            identity: 'bank',
            tableName: 'Bank',
            connection: 'simple',
            migrate: 'safe',
            autoPK: false,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: {
                id: {
                  type: 'integer',
                  columnName: 'BankID',
                  primaryKey: true
                },
                name: {
                  type: 'string',
                  columnName: 'BankName'
                }
            }
        });

        server.dogwater({
            identity: 'account',
            tableName: 'BankingDetail',
            connection: 'simple',
            migrate: 'safe',
            autoPK: false,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: {
                accountid: {
                  type: 'integer',
                  columnName: 'AccountID',
                  primaryKey: true
                },
                id: {
                  type: 'integer',
                  columnName: 'BankID'
                },
                name: {
                  type: 'string',
                  columnName: 'AccountHolderName'
                },
                account: {
                  type: 'string',
                  columnName: 'BankAccountNumber'
                },
                bank: {
                    model: 'bank'
                }
            }
        });
        
});    

exports = module.exports = {};
exports.server = server;
