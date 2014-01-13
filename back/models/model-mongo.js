/**
 * @fileOverview The base Model Class mongo models extend from.
 */
var util = require('util');

// var __ = require('lodash');

var Model = require('./model');

/**
 * The base Model Class mongo models extend from.
 *
 * @constructor
 * @extends {cc.Model}
 */
var ModelMongo = module.exports = function() {
  Model.call(this);
  /** @type {?mongoose.Schema} Instance of mongoose Schema */
  this.schema = null;
};
util.inherits(ModelMongo, Model);
