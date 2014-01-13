/**
 * @fileOverview The base Model Class all models extend from.
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// var __ = require('lodash');

/**
 * The base Model Class all models extend from.
 *
 * @extends {events.EventEmitter}
 * @constructor
 */
var Model = module.exports = function() {
  EventEmitter.call(this);

};
util.inherits(Model, EventEmitter);

/**
 * All Collections (tables)
 * @enum {string}
 */
Model.Collection = {
  RESULT: 'result',
};

/**
 * Helper for default value of date types.
 *
 * @param  {number} plusTime
 * @return {number} The JS timestamp in the future.
 * @static
 */
Model.defaultDate = function(plusTime) {
  return new Date(Date.now() + plusTime);
};
