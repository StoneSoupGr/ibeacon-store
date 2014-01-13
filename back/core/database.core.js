/**
 * @fileOverview Will handle connectivity to the databases and alert on issues.
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var when = require('when');
var async = require('async');
var config = require('config');
var mongoose = require('mongoose');
var log = require('logg').getLogger('cc.core.database');

var helpers = require('../util/helpers');

// models
var storeModel = require('../models/store.model').getInstance();

// var noop = function() {};

/**
 * Do not instanciate directly, use Conn.getInstance() to get the singleton.
 *
 * This module is an instance of EventEmitter.
 *
 * @event `open`: Emitted after we `connected` and `onOpen` is executed
 *   on all of this connections models.
 * @event `close`: Emitted after we `disconnected` and `onClose` executed
 *   on all of this connections models.
 * @event `error`: Emitted when an error occurs on this connection.
 * @constructor
 * @extends {events.EventEmitter}
 */
var Conn = module.exports = function() {
  EventEmitter.call(this);

  /** @type {boolean} In test mode use different connection settings */
  this._testMode = false;

  /** @type {boolean} Indicates if inited and event handlers added to libs */
  this._initialized = false;

  /**
   * Reference for the mongo reconnect setTimeout index or null.
   * @type {?setTimeout}
   * @private
   */
  this._mongoReconnTimer = null;

  /** @type {?mongoose.connect} The mongoose connection object */
  this.db = null;
};
util.inherits(Conn, EventEmitter);
helpers.addSingletonGetter(Conn);

/**
 * Mongo ready states.
 *
 * @type {number}
 */
Conn.MongoState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3
};

/**
 * Initiate the connections with the db.
 *
 * This method should only be called once.
 *
 * @return {when.Promise} a promise.
 */
Conn.prototype.init = function() {
  var def = when.defer();
  log.fine('init() :: Init. _initialized:', this._initialized);

  if (this._initialized) { return; }
  this._initialized = true;

  // setup global mongoose event handlers
  mongoose.connection.on('open', this._onOpen.bind(this));
  mongoose.connection.on('close', this._onClose.bind(this));
  mongoose.connection.on('error', this._onError.bind(this));

  this._connectMongo(this.initModels.bind(this, function(err) {
    if (err) {return def.reject(err);}
    def.resolve();
  }));
  return def.promise;
};

/**
 * Initialize all the models.
 *
 * @param {Function} done Callback.
 * @param  {Error=} err An error passed by mongoose.
 */
Conn.prototype.initModels = function(done, err) {
  if (err) { return done(err); }

  var initSequence = [
    storeModel.init.bind(storeModel),
  ];

  async.series(initSequence, function(err){
    if (err) {
      log.warn('initModels() :: Failed to initialize. Error:', err);
      done(err);
      process.exit(1);
    } else {
      log.info('initModels() :: Initialization Complete');
      done();
    }
  });



};


/**
 * Create a connection with mongo.
 *
 * @param {Function(string=)} done Optionally define a callback.
 * @private
 */
Conn.prototype._connectMongo = function(done) {
  log.fine('_connectMongo() :: Init');

  // force clear reconn timers
  clearTimeout(this._mongoReconnTimer);
  this._mongoReconnTimer = null;

  // check if already connected
  if (Conn.MongoState.CONNECTED === mongoose.connection.readyState) {
    done();
    return;
  }

  // http://mongoosejs.com/docs/connections.html
  var mongoUri = this.getMongoUri();
  var mongoOpts = {
    user: config.mongo.user,
    pass: config.mongo.password,
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };

  mongoose.connect(mongoUri, mongoOpts);
  var db = this.db = mongoose.connection.db;

  // rather silly callback mechanism.
  var cbDone = false;
  function onErrorLocal(err) {
    if (cbDone) {return;}
    cbDone = true;
    db.removeListener('open', onOpenLocal);
    done(err);
  }
  function onOpenLocal() {
    if (cbDone) {return;}
    cbDone = true;
    db.removeListener('error', onErrorLocal);
    done();
  }

  mongoose.connection.once('error', onErrorLocal);
  mongoose.connection.once('open', onOpenLocal);
};

/**
 * Close connection to Mongo db.
 *
 * @param {Function=} done optional.
 */
Conn.prototype.closeMongo = function(done) {
  log.info('closeMongo() :: Closing mongo connection... readyState:',
    mongoose.connection.readyState);
  mongoose.connection.close(done);
};

/**
 * re-start a mongo connection, will close connection first.
 *
 * @param  {Function} done Callback.
 */
Conn.prototype.openMongo = function(done) {
  log.info('openMongo() :: re-Opening mongo connection... readyState:',
    mongoose.connection.readyState);
  this.closeMongo(function(){
    this._connectMongo(done);
  }.bind(this));
};

/**
 * Returns the proper mongo uri to use for connecting.
 *
 * @return {string} the uri.
 */
Conn.prototype.getMongoUri = function() {
  return 'mongodb://' + config.mongo.hostname + '/' + config.mongo.database;
};

/**
 * Handle mongoose `open` events.
 * @private
 */
Conn.prototype._onOpen = function() {
  log.fine('_onOpen() :: Connected to mongo. Server:', config.mongo.hostname);

  if (this._mongoReconnTimer) {
    clearTimeout(this._mongoReconnTimer);
    this._mongoReconnTimer = null;
  }

  this.emit('open');
};

/**
 * Handle mongoose `close` events.
 * @private
 */
Conn.prototype._onClose = function() {
  log.warn('_onClose() :: Connection to mongoDB lost');

  // force
  mongoose.connection.readyState = Conn.MongoState.DISCONNECTED;

  // clear connection
  this.db.close();

  // Attempt to reconnect in x time.
  var reconnTime = config.mongo.reconnectTime;
  if (this._mongoReconnTimer) {
    log.fine('_onClose() :: Reconnection timer already running');
  } else {
    log.info('_onClose() :: Attempting to reconnect in ' + reconnTime + 'ms');
    this._mongoReconnTimer = setTimeout(this._connectMongo.bind(this), reconnTime);
  }

  this.emit('close');
};

/**
 * Handle mongoose `error` events.
 *
 * @param {Error} err Mongoose error.
 * @private
 */
Conn.prototype._onError = function(err) {
  log.warn('_onError() :: Connection Error:', err);

  this.emit('error', err);
};

