/**
 * @fileOverview Initialize webserver services, express, routes, etc
 */
var http = require('http');
var path = require('path');

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
var config = require('config');
var when = require('when');
var express = require('express');
// var RedisStore = require('connect-redis')(express);
var log = require('logg').getLogger('cc.core.webserver');

var corsMidd = require('../middleware/cors.midd').getInstance();
var router = require('../routes/router');
var globals = require('./globals');

var web = module.exports = {};

/** @type {?express} The express instance */
web.app = null;

/**
 * Kick off the webserver...
 *
 *
 * @return {when.Promise} a promise.
 */
web.init = function() {
  var def = when.defer();
  if (null !== web.app) {
    return def.resolve();
  }

  var app = web.app = express();

  // Discover proper port, Heroku exports it in an env
  var port;
  if (globals.Environments.HEROKU === globals.env) {
    port = process.env.PORT;
  } else {
    port = globals.isApi ? config.webserver.apiPort : config.webserver.port;
  }

  // Setup express
  app.set('port', port);
  app.set('views', __dirname + '/../../front/templates');
  app.set('view engine', 'jade');
  // enable CORS for current development flow.
  app.use(corsMidd.allowCrossDomain.bind(corsMidd));

  // redirect to www.
  var okUrls = [
    'check-connectivity.herokuapp.com',
    'localhost',
  ];
  // app.all(/.*/, function(req, res, next) {
  //   var host = req.header('host');
  //   if (host.match(/^www\..*/i)) {
  //     next();
  //   } else {
  //     if (okUrls.indexOf(host) >= 0) {
  //       next();
  //     } else {
  //       console.log('redirecting', host);
  //       // res.redirect(301, 'http://www.' + host);
  //       next();
  //     }
  //   }
  // });

  // Middleware
  app.use(express.bodyParser());
  app.use(express.compress());
  app.use(express.methodOverride());
  // app.use(express.cookieParser());
  app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
  });
  //
  // No sessions for now...
  //
  // Sessions stored in redis
  // app.use(express.session({
  //   secret: config.cookies.session.secret,
  //   cookie: {
  //     domain: config.cookies.domain,
  //     path: '/',
  //     httpOnly: false,
  //     maxAge: config.cookies.session.maxAge,
  //     store: new RedisStore(config.redis.session)
  //   }
  // }));

  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/../../front/static')));

  // development only
  if ('development' === app.get('env')) {
    app.use(express.errorHandler());
  }

  // add the routes
  router.init(app);

  // setup view globals
  app.locals.glob = globals.viewGlobals;

  web.start(app, function(err) {
    if (err) {return def.reject(err);}
    def.resolve();
  });


  return def.promise;
};



/**
 * Start the webserver.
 *
 * @param {Function(Error=)} done callback.
 * @return {http.Server} an http.createServer instance.
 */
web.start = function(app, done) {
  var httpServer = http.createServer(function(req, res){
    app(req, res);
  });
  var port = app.get('port');

  httpServer.on('clientError', function(err) {
    log.warn('start() :: Client Error on port:', port, ':: Exception:', err);
  });
  httpServer.on('error', function(err) {
    log.error('start() :: Failed to start web server on port:', port,
      ':: Exception:', err);
    done(err);
  });

  httpServer.listen(app.get('port'), function(){
    log.fine('start() :: Webserver launched. Listening on port: ' + port);
    done();
  });

  return httpServer;
};

