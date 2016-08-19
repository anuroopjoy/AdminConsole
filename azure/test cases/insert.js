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

let count;

module.exports = function(context, req) {
    
    if(req.method !== 'PUT'){
        context.res = {
            status: 403,
            body: "Only Put allowed"
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

            var request = new sql.Request(connection);
            request.query("SELECT MAX(id) AS count FROM Employees", (err, recordset) => {
                if(err){
                    context.done(err);
                }
                context.log(recordset[0].count);
                if(recordset[0].count === null){
                    count = 1;
                }
                else{
                    count = recordset[0].count + 1;
                }
            });

            context.log(req.body);
            if(req.body === undefined || req.body.firstname === undefined || req.body.lastname === undefined){
                context.res = {
                    status: 400,
                    body: 'firstname and lastname should be set in request body'
                };
                context.done();
            }
            else{
                var ps = new sql.PreparedStatement(connection);
                ps.input('id', sql.Int);
                ps.input('firstname', sql.VarChar(50));
                ps.input('lastname', sql.VarChar(50));
                ps.prepare("insert into Employees values (@id,@firstname,@lastname)", (err) => {
                    if(err){
                        context.done(err);
                    }
                    
                    ps.execute({id:count, firstname:req.body.firstname, lastname:req.body.lastname  }, (err, recordset, affected) => {
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