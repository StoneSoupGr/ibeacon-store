/**
 * @fileOverview The base Controller Class all controllers extend from.
 */
// var __ = require('lodash');

// var log = require('logg').getLogger('cc.Controller');

/**
 * The base Controller Class all controllers extend from.
 *
 * @constructor
 */
var Controller = module.exports = function() {
  /**
   * An array of controlling funcs that will handle requests.
   *
   * If more than two are pushed, all except the last one must use
   * the next() call.
   *
   * @type {Array.<Function(Object, Object, Function(Error=)=)}
   */
  this.use = [];

};
