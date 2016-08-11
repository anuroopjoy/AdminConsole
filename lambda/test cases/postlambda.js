'use strict'

const sql = require('mssql'); 

const config = {
    user: 'sa',
    password: 'admin2123',
    server: 'fuze-dev.c8eyl2jydvkm.us-east-1.rds.amazonaws.com', // You can use 'localhost\\instance' to connect to named instance
    database: 'rdslambda'
};

exports.handler = (event, context, callback) => {

    let count;
    
    console.log(JSON.stringify(event));
    
    const connection = new sql.Connection(config);
    
    connection.connect(function(err) {
        if(err){
            callback(err);
        }
        
        if(connection.pool !== null){
            console.log('Connection established successfully');

            var request = new sql.Request(connection);
            request.query("SELECT MAX(id) AS count FROM EventLog", function(err, recordset) {
                if(err){
                    callback(err);
                }
                console.log(recordset[0].count);
                if(recordset[0].count === null){
                    count = 1;
                }
                else{
                    count = recordset[0].count + 1;
                }
            });
            
            var ps = new sql.PreparedStatement(connection);
            ps.input('id', sql.Int);
            ps.input('event', sql.VarChar(50));
            ps.input('filename', sql.VarChar(50));
            ps.prepare("insert into EventLog values (@id,@event,@filename)", function(err) {
                if(err){
                    callback(err);
                }
                
                ps.execute({id:count, event:event.Records[0].eventName, filename:event.Records[0].s3.object.key  }, function(err, recordset, affected) {
                    if(err){
                        callback(err);
                    }
                    console.log(affected); 
                    
                    ps.unprepare(function(err) {
                        if(err){
                            callback(err);
                        }
                        ++count;
                        console.log("Transaction completed.");
                        connection.close();
                        console.log("Connection closed.");
                    });
                })
            });
        }
    });
};