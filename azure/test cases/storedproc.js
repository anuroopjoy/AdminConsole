'use strict';

const sql = require('mssql'); 

const config = {
    user: 'fuzeadmin',
    password: 'user@Fuze123',
    server: 'fuze-dev-db.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'testFuncDb',
    connectionTimeout: 30000,
    options: {
        encrypt: true // Use this if you're on Windows Azure 
    }
};

module.exports = function(context, req) {
    
    if(req.method !== 'POST'){
        context.res = {
            status: 403,
            body: "Only Post allowed"
        };
        context.done();
    }
    
    const connection = new sql.Connection(config);
    
    connection.connect((err) => {
        if(err){
            context.done(err);
        }
        
        if(connection.pool !== null){
            context.log('Connection established successfully');

            var request = new sql.Request(connection);
            request.execute('TestProc', (err, recordsets, returnValue, affected) => {
                if(err){
                    context.done(err);
                }
                context.log(recordsets.length);
                context.log(returnValue);
                context.log(affected);
                connection.close();
                context.log("Connection closed.");
                context.done();
            });
        }
    });
};