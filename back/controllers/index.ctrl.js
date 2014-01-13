/**
 * @fileOverview GET / Home page.
 */

var util = require('util');

// var __ = require('lodash');
var config = require('config');
// var log = require('logg').getLogger('cc.ctrl.Homepage');

var Controller = require('./controller');
var helpers = require('../util/helpers');
var Set = require('collections/set');

var rpc;

/**
 * The home page.
 *
 * @contructor
 * @extends {cc.Controller}
 */
var Home = module.exports = function(){
  Controller.apply(this, arguments);
  this.use.push(this._useIndex.bind(this));
};
util.inherits(Home, Controller);
helpers.addSingletonGetter(Home);

Home.frontTokenSet = new Set();

/**
 * Get a unique front token
 *
 * @return {string} a unique token.
 * @static
 */
Home.getFrontToken = function() {
  var frontToken = helpers.generateRandomString(6);

  // TODO check if returns false and regenerate
  Home.frontTokenSet.add(frontToken);

  return frontToken;
};


/**
 * The index page.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Home.prototype._useIndex = function(req, res) {
  var frontToken = Home.getFrontToken();
  rpc.send('frontToken', frontToken);
  res.render('index', {
    frontToken: frontToken,
    ip: req.connection.remoteAddress,
    echoServer: config.echoServer,
  });
};
