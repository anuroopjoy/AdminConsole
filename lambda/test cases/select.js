'use strict'

const sql = require('mssql'); 

const config = {
    user: 'sa',
    password: 'admin2123',
    server: 'fuze-dev.c8eyl2jydvkm.us-east-1.rds.amazonaws.com', // You can use 'localhost\\instance' to connect to named instance
    database: 'rdslambda'
};
    
exports.handler = (event, context, callback) => {

    var connection = new sql.Connection(config);
    
    connection.connect(function(err) {
        if(err){
            callback(err);
        }
        
        if(connection.pool !== null){
            console.log('Connection established successfully');

            var request = new sql.Request(connection);
            request.query("SELECT * FROM employees", function(err, recordset) {
                if(err){
                    callback(err);
                }
                console.log(recordset);
                connection.close();
                console.log("Connection closed.");
                callback(null, 'Function completed successfully');
            });
        }
    });
};