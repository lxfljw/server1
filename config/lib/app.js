'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  mongoose = require('./mongoose'),
  express = require('./express'),
  chalk = require('chalk'),
  seed = require('./seed'),
  path = require('path'),
  logger = require(path.resolve('./config/lib/logger.js'));  

function seedDB() {

  //logger.debug('seedDB  ',config.seedDB, config.seedDB.seed);
  if (config.seedDB && config.seedDB.seed) {
    logger.info(chalk.bold.red('Warning:  Database seeding is turned on'));
    seed.start();
  }
}

// Initialize Models
mongoose.loadModels(seedDB);

module.exports.init = function init(callback) {  
  mongoose.connect(function (db) {
    // Initialize express
    var app = express.init(db);
    if (callback) callback(app, db, config);

  });
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app, db, config) {

    // Start the app by listening on <port> at <host>
    app.listen(config.port, config.host, function () {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      logger.info('--');
      logger.info(chalk.green(config.app.title));
      logger.info();
      logger.info(chalk.green('Environment:     ' + process.env.NODE_ENV));
      logger.info(chalk.green('Server:          ' + server));
      logger.info(chalk.green('Database:        ' + config.db.uri));
      logger.info(chalk.green('App version:     ' + config.meanjs.version));
      if (config.meanjs['meanjs-version'])
        logger.info(chalk.green('MEAN.JS version: ' + config.meanjs['meanjs-version']));
      logger.info('--');

      if (callback) callback(app, db, config);
    });

  });

};
