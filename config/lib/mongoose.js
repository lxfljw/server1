'use strict';

/**
 * Module dependencies.
 http://blog.mlab.com/2014/04/mongodb-driver-mongoose/
 */
var config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose'),
  logger = require(path.resolve('./config/lib/logger.js'));

mongoose.Promise = require('bluebird');

// Load the mongoose models
module.exports.loadModels = function (callback) {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (cb) {
  var _this = this;


  //console.log(config)
  

  var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
    // Log Error
    if (err) {
      logger.error(chalk.red('Could not connect to MongoDB!'),err);
    } else {

      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (cb) cb(db);
    }
  });
};

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    logger.error(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};
