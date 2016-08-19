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
    
    var connection = new sql.Connection(config);
    
    connection.connect((err) => {
        if(err){
            context.done(err);
        }
        
        if(connection.pool !== null){
            context.log('Connection established successfully');

            context.log(req.body);
            if(req.body === undefined || req.body.newname === undefined || req.body.oldname === undefined){
                context.res = {
                    status: 400,
                    body: 'oldname and newname should be set in request body'
                };
                context.done();
            }
            else{
                var ps = new sql.PreparedStatement(connection);
                ps.input('oldname', sql.VarChar(50));
                ps.input('newname', sql.VarChar(50));
                ps.prepare("UPDATE employees set lastname=@newname where firstname = @oldname", (err) => {
                    if(err){
                        context.done(err);
                    }
                    
                    ps.execute({newname:req.body.newname, oldname:req.body.oldname  }, (err, recordset, affected) => {
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