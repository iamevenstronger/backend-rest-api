'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Relish = require('relish')({});
const HapiSwagger = require('hapi-swagger');
const Joi = require('joi');
var mysql = require('mysql');
const server = new Hapi.Server();

// mysqk connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "demo_user"
});

// should connect sql from the start!
con.connect(function (err) {
    if (err) throw err;
    console.log("Mysql Connected to demo_user!");
});
// Create a server with a host and port
server.connection({
    host: 'localhost',
    port: 3000,
    // for cross-origin
    routes: {
        cors: true
    }
});

const options = {
    info: {
        'title': 'Demo API Documentation',
        'version': "1.0.0",
    }
};

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], (err) => {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    });

// Add the route
server.route([{
    method: 'POST',
    path: '/demo/useradd',
    config: {
        handler: function (request, reply) {
            console.log(request.payload);
            let username = request.payload.username;
            let email = request.payload.email;
            let age = request.payload.age;
            var sql = "INSERT INTO userdata (id,username,email,age) VALUES ('','" + username + "','" + email + "','" + age + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            reply({ success: true, message: "User data inserted!" });
        },
        description: 'Post user data',
        notes: 'demo post request',
        tags: ['api'],
        validate: {
            failAction: Relish.failAction,
            payload: {
                username: Joi.string().required(),
                email: Joi.string().email().required(),
                age: Joi.number().min(18)
            }
        }
    }
},{
    method: 'GET',
    path: '/demo/getuser/{id}',
    config: {
        handler: function (request, reply) {
            console.log(request.params);
            let id = request.params.id;
            var sql = "select * from userdata where id='"+id+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result);
                reply(result);
            }); 
        },
        description: 'Get user data',
        notes: 'demo Get request',
        tags: ['api'],
        validate: {
            failAction: Relish.failAction,
            params: {
                id :Joi.number().required()
            }
        }
    }
}]);

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});