/**
 * @fileOverview GET /r/:id
 */

var util = require('util');
var __ = require('lodash');
var config = require('config');
var log = require('logg').getLogger('cc.ctrl.resultRead');

var Controller = require('./controller');
var resultModel = require('../models/result.model').getInstance();
var commonPorts = require('../../echoServer/core/tcp-port-numbers');
var helpers = require('../util/helpers');

/**
 *
 * @contructor
 * @extends {cc.Controller}
 */
var ResultRead = module.exports = function(){
  Controller.apply(this, arguments);
  this.use.push(this._useResultRead.bind(this));

};
util.inherits(ResultRead, Controller);
helpers.addSingletonGetter(ResultRead);

/**
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
ResultRead.prototype._useResultRead = function(req, res) {
  var uuid = req.params.uuid;
  log.finer('_useResultRead() :: request for result:', uuid);

  resultModel.Model.findOne({uniqueUrl: uuid}, function(err, resObj) {
    if (err) {
      return res.send(500, 'Error');
    }

    if (!__.isObject(resObj)) {
      return res.send(500, 'Not Found');
    }


    if (resObj) {
      res.json(resObj.toPublic());
    } else {
      res.json(401, {error: 'Not Found'});
    }
  });
};
