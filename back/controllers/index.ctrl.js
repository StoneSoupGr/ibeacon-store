/**
 * @fileOverview GET / Home page.
 */

var util = require('util');

// var __ = require('lodash');
// var config = require('config');
// var log = require('logg').getLogger('cc.ctrl.Homepage');

var Controller = require('./controller');
var helpers = require('../util/helpers');

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

/**
 * The index page.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Home.prototype._useIndex = function(req, res) {
  res.render('index', {
    ip: req.connection.remoteAddress,
  });
};
