/**
 * @fileOverview Cors Middleware.
 */

var util = require('util');

var log = require('logg').getLogger('cc.midd.Cors');
var config = require('config');

var Middleware = require('./middleware');
var helpers = require('../util/helpers');

/**
 * The Cors Middleware.
 *
 * @contructor
 * @extends {ts.Middleware}
 */
var Cors = module.exports = function(){
  Middleware.apply(this, arguments);
};
util.inherits(Cors, Middleware);
helpers.addSingletonGetter(Cors);

/**
 * CORS Middleware
 *
 * @see http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 */
Cors.prototype.allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');// config.webserverUrl);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-front-token, Accept');

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
