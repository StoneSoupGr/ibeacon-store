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

var SEP = '/';

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
  log.fine('_useResult() :: init, submitting data.');

  // if (!frontToken || !IndexCtrl.frontTokenSet.has(frontToken)) {
  //   return res.send(400, 'Nope');
  // }

  if (!this._validateBody(req, res, req.body)) {
    return;
  }
  var frontToken = req.header('x-front-token');

  // Validate the identity of the poster
  if (frontToken !== 'ibeacon-stonesoup') {
    return res.send(401, 'No Access');
  }

  // Assign values to store
  var store = new StoreModel.Model();
  store.creatorIp = req.connection.remoteAddress;
  store.uuid = req.body.uuid;
  store.minNum = req.body.minNum;
  store.majNum = req.body.majNum;
  store.storeObj = req.body.data;
  store.headers = req.headers;
  store.uniqueUrl = store.uuid + SEP + store.majNum + SEP + store.minNum;
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

  if (!__.isString(body.majNum)) {
    res.send(400, 'No "majNum" parameter was defined');
    return false;
  }

  if (!__.isString(body.minNum)) {
    res.send(400, 'No "minNum" parameter was defined');
    return false;
  }

  if (!__.isString(body.data)) {
    res.send(400, '"data" parameter is not of type Object');
    return false;
  }

  return true;
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
