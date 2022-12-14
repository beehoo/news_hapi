'use strict'

const Hapi = require('@hapi/hapi');
const JWT = require('hapi-auth-jwt2');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const routes = require('./routes');
const { dbUrl, JWTSecret } = require('./config');

const validate = async function (decoded, request, h) {
  if (!decoded) {
    return { isValid: false }
  }
  else {
    return { isValid: true }
  }
};

const init = async () => {
  const server = Hapi.server({
    host: 'localhost',
    port: 9527,
    debug: false,
    routes: {
      cors: true
    }
  });

  // db
  const dbOpts = {
    url: dbUrl,
    settings: {
      maxPoolSize: 10
    },
    decorate: true
  };

  // swagger
  const swaggerOptions = {
    info: {
      title: 'API文档',
      version: '0.0.1',
    }
  };

  await server.register([
    Inert,
    Vision,
    JWT,
    {
      plugin: require('hapi-mongodb'),
      options: dbOpts
    },
    {
      plugin: require('hapi-pino'),
      options: {
        // prettyPrint: true,
        redact: ['req.headers.authorization']
      }
    },
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ])

  // jwt
  server.auth.strategy('jwt', 'jwt', {
    key: JWTSecret,
    validate,
    verifyOptions: { algorithms: ["HS256"] }
  })
  server.auth.default('jwt')

  // routes
  server.route(routes);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
});

init();