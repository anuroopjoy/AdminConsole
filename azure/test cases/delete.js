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
    
    if(req.method !== 'DELETE'){
        context.res = {
            status: 403,
            body: "Only Delete allowed"
        };
        context.done();
    }
    
    var connection = new sql.Connection(config);
    
    connection.connect((err) => {
        if(err){
            context.done(err);
        }
        
        if(connection.pool !== null){
            context.log('Connection established successfully');

            context.log(req.body);
            if(req.body === undefined || req.body.firstname === undefined){
                context.res = {
                    status: 400,
                    body: 'firstname should be set in request body'
                };
                context.done();
            }
            else{
                var ps = new sql.PreparedStatement(connection);
                ps.input('firstname', sql.VarChar(50));
                ps.prepare("DELETE FROM employees where firstname = @firstname", (err) => {
                    if(err){
                        context.done(err);
                    }
                    
                    ps.execute({firstname:req.body.firstname}, (err, recordset, affected) => {
                        if(err){
                            context.done(err);
                        }
                        context.log(affected); 
                        
                        ps.unprepare((err) =>{
                            if(err){
                                context.done(err);
                            }
                            context.log("Transaction completed.");
                            connection.close();
                            context.log("Connection closed.");
                            context.done();
                        });
                    });
                });
            }
        }
    });
};