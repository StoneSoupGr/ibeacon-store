/**
 * @fileOverview The base Middleware Class, all Middlewares extend from.
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * The base Middleware Class, all Middlewares extend from.
 *
 * @constructor
 * @extends {events.EventEmitter}
 */
var Middleware = module.exports = function() {
  EventEmitter.call(this);
};
util.inherits(Middleware, EventEmitter);
