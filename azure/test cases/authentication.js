'use strict';
const auth0 = require('azure-functions-auth0')({  
  clientId: '3dx0S39gQ127aGi9Q6qs7uLATJpQ1PZu',
  clientSecret: 'aXVlRk9kT3pzdVBiRlBMVnlHMHc5WVlQZmg5ZG9rZ1FvN011dVVOSDk3V1cxWEtrZWVUTTZsdlRKU3MzMWt2eA==',
  domain: 'anuroopjoy.auth0.com'
});

module.exports = auth0(function(context, req) {  
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body && req.body.name) {
        context.res = {
            body: `Hello ${req.body.name}`
        };
    }
    else {
        context.res = {
            status: 400,
            body: "The user seems to be missing"
        };
    }
    context.log(context.res);
    context.done();
});