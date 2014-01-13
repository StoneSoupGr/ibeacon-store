/**
 * @fileOverview The talksession routes.
 */

var log = require('logg').getLogger('cc.webRouter');

var HomeCtrl = require('../controllers/index.ctrl');
var StoreCtrl = require('../controllers/store.ctrl');
var ResultReadCtrl = require('../controllers/resultRead.ctrl');
var router = module.exports = {};


router.init = function(app) {
  log.fine('init() :: initializing routes...');
  var homeCtrl = HomeCtrl.getInstance();
  var storeCtrl = StoreCtrl.getInstance();
  var resultReadCtrl = ResultReadCtrl.getInstance();

  app.get('/', homeCtrl.use);

  app.post('/store', storeCtrl.use);
  app.get('/r/:uuid?', resultReadCtrl.use);
};
