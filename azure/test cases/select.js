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
    
    if(req.method !== 'GET'){
        context.res = {
            status: 403,
            body: "Only Get allowed"
        };
        context.done();
    }
    
    var connection = new sql.Connection(config);
    
    context.log("Before connecting");
    
    connection.connect((err) => {
        if(err){
            context.done(err);
        }
        
        if(connection.pool !== null){
            context.log('Connection established successfully');

            var request = new sql.Request(connection);
            request.query("SELECT * FROM Employees", (err, recordset) => {
                if(err){
                    context.done(err);
                }
                context.log(recordset);
                connection.close();
                context.log("Connection closed.");
                
                context.res = {
                    body: recordset
                };
                
                context.done();
            });
        }
    });
};