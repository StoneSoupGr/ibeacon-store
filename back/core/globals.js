/**
 * @fileOverview A hash containing global required environmental values.
 *
 */
var os = require('os');

var config = require('config');
// var log = require('logg').getLogger('cc.core.globals');

var helpers = require('../util/helpers');
var glob = module.exports = {};


/**
 * The supported environments
 *
 * @enum {string}
 */
glob.Environments = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  HEROKU: 'heroku',
  EB: 'aws_bs_one',
};

/** @type {boolean} If application runs directly from shell, gets set on app */
glob.isStandAlone = true;

/** @type {string} a unique identifier string for this node process. */
glob.serverId = os.hostname() + '-' + process.pid + '-' +
  helpers.generateRandomString(6);

/**
 * Returns the current environemnt based on shell enviornment variable NODE_ENV
 * defaults to development.
 *
 * @return {cc.core.globals.Environments} One of the supported environments.
 */
glob.getEnvironment = function() {
  var env = process.env.NODE_ENV || glob.Environments.DEVELOPMENT;

  for (var envIter in glob.Environments) {
    if (env === glob.Environments[envIter]) {
      return env;
    }
  }

  return glob.Environments.DEVELOPMENT;
};

/**
 * The current environment canonicalized based on supported envs.
 * @type {ts.core.globals.Environments}
 */
glob.env = glob.getEnvironment();

/** @type {boolean} If we are on development environment */
glob.isDev = glob.env === glob.Environments.DEVELOPMENT;

/** @type {boolean} If the server is running in API mode */
glob.isApi = false;


/** @type {Object} Global variables available to views */
glob.viewGlobals = {
  ga: config.ga,
  env: glob.env,
};


