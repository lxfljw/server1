"use strict";

var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter(),
    chalk = require('chalk'),
    uuid = require('node-uuid'),
    path = require('path'),
    logger = require(path.resolve('./config/lib/logger.js'));


class DataTransformer {

  
  constructor() {

  } 


  addMetadata(){
  	
  }

        
};

module.exports = DataTransformer;    
