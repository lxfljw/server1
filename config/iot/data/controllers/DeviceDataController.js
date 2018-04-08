'use strict';

var path = require('path'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    logger = require(path.resolve('./config/lib/logger.js'));

var config = require(path.resolve('./config/env/default.js')),
    errors = require(path.resolve('./config/lib/errors.js')),
    is = require(path.resolve('./config/lib/middleware/validation/is.js'));


var dataSchema = require('../models/deviceDataSchema.js');
var deviceDataModel = mongoose.model('DeviceDataModel', new dataSchema()  );
deviceDataModel.init('test', {interval: 5,verbose: false});

class DeviceDataController {


  constructor() {

  }


  getDeviceData(device_id, to, from){

      var format = '[x,y]';

      deviceDataModel.findData({ 
         actor:device_id,
         from: from,
         to: to,
         format: format,
         interval:60,  condition: {} },function(err,data){
        if(err){
          logger.debug('errr  ');


        }else if(!data){
          logger.debug('not data  ');


        }else{
          logger.debug(data);
        }
      })


  }

}      


module.exports = DeviceDataController;