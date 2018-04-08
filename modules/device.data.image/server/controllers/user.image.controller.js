'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    path = require('path'),
    config = require(path.resolve('./config/env/default.js')),
    errors = require(path.resolve('./config/lib/errors.js')),
    is = require(path.resolve('./config/lib/middleware/validation/is.js')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    hat = require('hat'),
    multer  = require('multer'),
    logger = require(path.resolve('./config/lib/logger.js'));


/*
  POST 
  http://localhost:3000/v1/devices/device_123/images

  Content-Type: application/json
*/




exports.saveImage = function(req, res, next){

    var device_id = req.params.device_id ;

    if(!device_id){
        throw new errors.InValidRequestError({'errorDetails':'Missing parameter: device_id'});       
    }
    if(!is.vschar(device_id)) {
        throw new errors.InvalidRequestError({'errorDetails':'Invalid parameter: device_id'});
    }

    // https://github.com/expressjs/multer/issues/196
    // https://github.com/expressjs/multer/issues/170

    var upload = multer({ storage: multer.diskStorage({
        destination: (req, file, cb) => {
          var date = new Date();
          console.log(file);
          var day = date.getFullYear()+"_"+(date.getMonth()+1)+"_"+date.getDate();
          logger.debug(day);
          require('fs').mkdir('uploads/'+day, err => {
            cb(null, 'uploads/'+day);
          });
        },
        filename: (req, file, cb) => {
          logger.debug(file.originalname);
          var name = file.originalname.split('/').pop().trim().split('.')[0];
          var date = new Date();
          var now = date.getHours()+"_"+date.getMinutes();          
          cb(null, device_id+now+".jpg");
        }
      })
    }).single('file');

    uploadImage()
      .then(function () {
        logger.info('uploadImage    ...... ');

        res.json('user');
      })
      .catch(function (err) {
        res.status(400).send(err);
    });

    function uploadImage () {
      return new Promise(function (resolve, reject) {
        upload(req, res, function (uploadError) {
          if (uploadError) {
            console.log('controllers reject image upload',uploadError);
            reject(errorHandler.getErrorMessage(uploadError));
          } else {
            logger.info('accept upload image','./uploads/'+device_id+'.jpg');

            resolve();
          }
        });
      });
    }
}


/*
  GET 
  http://localhost:3000/v1/devices/:device_id?date=
  
  http://localhost:3000/v1/devices/images/device_123?date=2016.2.14
*/
exports.getImages = function(req, res, next){

    var device_id = req.params.device_id, 
        date = req.query.date;


    logger.info('-----------------------------------getImages',device_id,date);

    /*
        if(!device_id){
            throw new errors.InValidRequestError({'errorDetails':'Missing parameter: device_id'});       
        }
        if(!is.vschar(device_id)) {
            throw new errors.InvalidRequestError({'errorDetails':'Invalid parameter: device_id'});
        }
    */
 
    fileManager.getFilesByDate(device_id, new Date())
            .then(function(files) {
                console.log(files.length);
                for(var i in files)
                  console.log(   files[i] );
              res.status(200).json({'message':"ok",'data':files });
              return null;

            })
            .catch(function(err){
              console.log('error:', err);
              res.status(404).json({'message':"not found"});
              return null;
            });

}

exports.deleteImages = function(req, res, next){

    var device_id = req.params.device_id, 
        date = req.query.date;


    logger.info('-----------------------------------getImages',device_id,date);

    /*
        if(!device_id){
            throw new errors.InValidRequestError({'errorDetails':'Missing parameter: device_id'});       
        }
        if(!is.vschar(device_id)) {
            throw new errors.InvalidRequestError({'errorDetails':'Invalid parameter: device_id'});
        }
    */
 
    fileManager.getFilesByDate(device_id, new Date())
            .then(function(files) {
                console.log(files.length);
                for(var i in files)
                  console.log(   files[i] );
              res.status(200).json({'message':"ok",'data':files });
              return null;

            })
            .catch(function(err){
              console.log('error:', err);
              res.status(404).json({'message':"not found"});
              return null;
            });

}
