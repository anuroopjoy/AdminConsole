'use strict'

var myImports = require('./server.js');
const server = myImports.server;

const add = function (a, b, next) {

    return next(null, Number(a) + Number(b));
};

server.method('sum', add, {
    cache: {
        cache: 'redisCache',
        expiresIn: 30 * 1000,
        generateTimeout: 100
    }
});

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {
         server.methods.sum(request.params.a, request.params.b, (err, result, cached, report) => {

            if (err) {
                return reply(err);
            }
            const lastModified = cached ? new Date(cached.stored) : new Date();
            return reply(result).header('last-modified', lastModified.toUTCString());
        });
    }
});

server.route({
    method: 'get',
    path: '/bank/id/{id}',
    handler: function (request, reply) {

        const Banks = request.collections().bank;
        console.log(Banks);
        reply(Banks.findOneById(request.params.id));
    }
});

server.route({
    method: 'get',
    path: '/bank/all',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        console.log(Banks);
        let result = Banks.find({select: ['name'], sort: {id:1, name: 1}, limit: 10});
        reply(result);
    }
});

server.route({
    method: 'get',
    path: '/bank/name/{name}',
    handler: function (request, reply) {

        const Banks = request.collections().bank;
        console.log(Banks);
        reply(Banks.find({ name: { 'contains': request.params.name}}));
    }
});

server.route({
    method: 'POST',
    path: '/bank/create',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        Banks.create({
          id: request.payload.id,
          name: request.payload.name
        })
        .exec(function(err, bank) {
            if (err) {
                throw err;
            }
            console.log(`${bank.id} created successfully`);
            reply();
        });
    }
});

server.route({
    method: 'DELETE',
    path: '/bank/remove',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        const where = {
            id: request.payload.id
        };
        Banks.findOne().where(where)
        .exec(function(err) {
            if (err) {
                throw err;
            }
            Banks.destroy(where)
            .exec(function(err) {
                if (err) {
                    throw err;
                }
                console.log("removed successfully");
                reply();
            });
        })
    }
});

server.route({
    method: 'PUT',
    path: '/bank/update',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        console.log(Banks);
        console.log(`${request.payload.id} = ${request.payload.name}`);
        const where = {
            id: request.payload.id
        };
        Banks.findOne().where(where)
        .exec(function(err, bank) {
            if (err) {
                throw err;
            }
            // reply(bank.name);
            Banks.update(where,{name: request.payload.name})
            .exec(function(err, bank) {
                if (err) {
                    throw err;
                }
                console.log(`${bank.length} row(s) updated successfully`);
                reply();
            });
        })
    }
});

// server.route({
    // method: 'get',
    // path: '/account/all',
    // handler: function (request, reply) {
        // const Accounts = request.collections().account;
        // console.log(Accounts);
        // Accounts.find()
                // .populate('bank',{select: ['name']})
                // .exec(function (err, usersNamedFinn){
                    // if (err) {
                        // throw(err);
                    // }

                    // console.log(usersNamedFinn.length);
                    // console.log(usersNamedFinn);

                    // reply(usersNamedFinn);
                // });
    // }
// });

server.route({
    method: 'get',
    path: '/account/{id}',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        // console.log(Banks);
        Banks.query('SELECT BankName FROM Bank WHERE BankID = $1' , [request.params.id] , function(err,results){
            reply(results);
        });
    }
});

server.route({
    method: 'get',
    path: '/account/join',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        // console.log(Banks);
        Banks.query('SELECT e.AccountID, e.AccountHolderName, p.BankName FROM BankingDetail AS e INNER JOIN Bank AS p ON e.BankID = p.BankID' , null , function(err,results){
            reply(results);
        });
    }
});

server.route({
    method: 'post',
    path: '/account/store',
    handler: function (request, reply) {
        const Banks = request.collections().bank;
        // console.log(Banks);
        Banks.query('TestProc' , null , function(err,results){
            reply();
        });
    }
});

exports = module.exports = {};
exports.server = server;
