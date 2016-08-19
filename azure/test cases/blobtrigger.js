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

module.exports = function(context, myBlob) {
    
    const connection = new sql.Connection(config);
    
    connection.connect((err) => {
        if(err){
            context.done(err);
        }
        
        if(connection.pool !== null){
            context.log('Connection established successfully');

            var request = new sql.Request(connection);
            request.query("SELECT MAX(id) AS count FROM EventLog", (err, recordset) => {
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
            
            var ps = new sql.PreparedStatement(connection);
            ps.input('id', sql.Int);
            ps.input('filename', sql.VarChar(50));
            ps.input('content', sql.VarChar(1024));
            ps.prepare("insert into EventLog values (@id,@filename,@content)", (err) => {
                if(err){
                    context.done(err);
                }
                
                ps.execute({id:count, filename:context.bindingData.BlobTrigger , content:myBlob  }, (err, recordset, affected) => {
                    if(err){
                        context.done(err);
                    }
                    context.log(affected); 
                    
                    ps.unprepare((err) => {
                        if(err){
                            context.done(err);
                        }
                        context.log("Transaction completed.");
                        connection.close();
                        context.log("Connection closed.");
                    });
                });
            });
        }
    });
};