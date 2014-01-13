/**
 * @fileOverview The Check Results model.
 */

var util = require('util');

var log = require('logg').getLogger('cc.model.Result');
// var __ = require('lodash');

var Model = require('./model');
var ModelMongo = require('./model-mongo');
var orm = require('./orm-mongo');
var helpers = require('../util/helpers');

/**
 * The Result model.
 *
 * @constructor
 * @extends {cc.ModelMongo}
 */
var Result = module.exports = function(){
  ModelMongo.apply(this, arguments);
};
util.inherits(Result, ModelMongo);
helpers.addSingletonGetter(Result);


/**
 * Define the Result schema
 * @type {Object}
 */
Result.Schema = {
  uniqueUrl: {type: String, required: true},
  creatorIp: {type: String, trim: true, required: true},
  createdOn: {type: Date, default: Date.now},
  storeObj: {type: Object},
  uuid: {type: String, required: true},
  majNum: {type: Number, required: true},
  minNum: {type: Number, required: true},
  headers: {type: Object},
};

/**
 * Initialize the model.
 *
 * @param {Function(Error=)} done callback.
 */
Result.prototype.init = function(done) {
  log.fine('init() :: initializing Result Model...');

  this.schema = new orm.Schema(Result.Schema);

  this.schema.virtual('id').get(function(){
    return this._id;
  });


  // define indexes
  this.schema.index({uniqueUrl: 1}, {unique: true});
  this.schema.index({createdOn: 1});

  // define methods
  this.schema.methods.toPublic = this._toPublic;


  // initialize model
  this.Model = orm.model(Model.Collection.RESULT, this.schema);

  done();
};

/**
 * Return a properly formated result object.
 *
 * @this {mongoose.Schema} Mongoose context.
 * @return {Object} Properly formated result object.
 * @private
 */
Result.prototype._toPublic = function() {
  var res = this.toObject({getters: true});

  delete res.__v;
  delete res.id;
  delete res._id;

  return res;
};
