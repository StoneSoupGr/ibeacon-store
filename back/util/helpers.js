/**
 * @fileoverview Helpers.
 */

var __ = require('lodash');
var config = require('config');
var slug = require('slug');

var helpers = module.exports = {};

var noop = function() {};

/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} Ctor The constructor for the class to add the static
 *     method to.
 */
helpers.addSingletonGetter = function(Ctor) {
  Ctor.getInstance = function() {
    if (Ctor._instance) {
      return Ctor._instance;
    }
    return Ctor._instance = new Ctor;
  };
};

/**
 * Generate a random string.
 *
 * @param  {number=} optLength How long the string should be, default 32.
 * @return {string} a random string.
 */
helpers.generateRandomString = function(optLength) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

  var length = optLength || 32;
  var string = '';
  var randomNumber = 0;
  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * chars.length);
    string += chars.substring(randomNumber, randomNumber + 1);
  }

  return string;
};

/**
 * Generate a random number, returns type string!.
 *
 * @param  {number=} optLength How long, default 20.
 * @return {string} A random number cast to string.
 */
helpers.generateRandomNumber = function(optLength) {
  var nums = '0123456789';
  var numLen = nums.length;
  var length = optLength || 20;

  var string = '';
  var randomNumber = 0;
  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * numLen);
    string += nums.substring(randomNumber, randomNumber + 1);
  }

  return string;
};

/**
 * Salt a string.
 *
 * @param  {string} src The string we want to salt.
 * @return {string} The string salted.
 */
helpers.salt = function(src) {
  return src + config.crypto.salt;
};

/**
 * Returns a unique-ish url-friendly string,
 * uses a 6 random number to raise entropy.
 *
 * @param  {string} token The token you need to be urlified.
 * @param {number=} optRandLen Define how many random numbers, default 6,
 *  disable 0.
 * @return {string} urlefied string.
 */
helpers.urlify = function(token, optRandLen) {
  var randLen = 6;
  if (__.isNumber(optRandLen)) {
    randLen = optRandLen;
  }
  var out = '';
  if (randLen) {
    out += helpers.generateRandomNumber(randLen);
    out += '-';
  }
  out += slug(token).toLowerCase();
  return out;
};
