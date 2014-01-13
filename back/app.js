
/**
 * Module dependencies.
 */

var log = require('logg').getLogger('cc.bootstrap');

var webserver = require('./core/webServer.core');
var rpcServer = require('./core/rpcServer.core');
var database = require('./core/database.core').getInstance();
var echoServer = require('../echoServer/echoServer');
var logger = require('./util/logger');
var globs = require('./core/globals');


// Initialize logging facilities
logger.init();

log.info('Initializing... standAlone:', globs.isStandAlone,
  ':: System NODE_ENV:', process.env.NODE_ENV, ':: App Environment:', globs.env,
  ':: Server ID:', globs.serverId);

rpcServer.init()
  .then(database.init.bind(database))
  .then(webserver.init)
  .then(echoServer.init.bind(null, true))
  .then(function(){
    log.info('Init finish.');
    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err); }
        process.setuid(stats.uid);
      });
    }

  }, function(err){
    log.error('Error on boot:', err);
    process.exit(-1);
  });
