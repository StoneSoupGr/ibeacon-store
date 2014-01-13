/**
 * @fileOverview POST /result.
 */

var util = require('util');

var log = require('logg').getLogger('cc.ctrl.result');
var __ = require('lodash');

var Controller = require('./controller');
// var IndexCtrl = require('./index.ctrl');
var StoreModel = require('../models/store.model').getInstance();
var helpers = require('../util/helpers');

/**
 *
 * @contructor
 * @extends {cc.Controller}
 */
var Store = module.exports = function(){
  Controller.apply(this, arguments);
  this.use.push(this._store.bind(this));

};
util.inherits(Store, Controller);
helpers.addSingletonGetter(Store);

/**
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Store.prototype._store = function(req, res) {
  // var frontToken = req.header('x-front-token');
  var frontToken = 'DONT USE YET';
  log.fine('_useResult() :: init, submitting data. frontToken:', frontToken);

  // if (!frontToken || !IndexCtrl.frontTokenSet.has(frontToken)) {
  //   return res.send(400, 'Nope');
  // }


  if (!this._validateBody(req, res, req.body)) {
    return;
  }

  var store = new StoreModel.Model();
  store.creatorIp = req.connection.remoteAddress;
  store.storeObj = this._assignValues(req.body);
  store.headers = req.headers;
  store.save(this._onSave.bind(this, req, res));
};

Store.prototype._validateBody = function(req, res, body) {

  if (!__.isObject(body)) {
    res.send(400,'There is no proper body');
    return false;
  }

  if (!__.isString(body.uuid)) {
    res.send(400, 'No "uuid" parameter was defined');
    return false;
  }

  if (!__.isString(body.data)) {
    res.send(400, '"data" parameter is not of type Object');
    return false;
  }

  return true;
};

Store.prototype._assignValues = function(body) {
  var storeObj = {
    uuid: body.uuid,
    data: body.data,
  };
  return storeObj;
};

/**
 * On Model save listener.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error=} err error.
 * @param {Mongoose.Document} res the result object.
 */
Store.prototype._onSave = function(req, res, err, resDoc) {
  if (err) {
    log.warn('_onSave() :: Error:', err);
    return res.send(500, 'pigs in space');
  }
  log.info('_onSave () :: Saved. uniqueUrl:', resDoc.uniqueUrl);

  res.json({'url': resDoc.uniqueUrl});
};
