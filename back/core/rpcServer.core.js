/**
 * @fileOverview RPC Server
 */

var log = require('logg').getLogger('cc.rpcServer');
var when = require('when');

var rpcLib = require('../../rpc/rpc-lib');

var rpc = module.exports = {};

rpc.init = function() {
  log.fine('init() :: Initializing...');

  rpc.serv = new rpcLib.Server();

  return when.defer().resolve();
};
