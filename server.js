'use strict';

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
var server = app.start();

/*
var path = require('path');
var FileManager = require('./FileManager.js');
var projectId = process.env.GCLOUD_PROJECT;
let fileManager = new FileManager('google',
                                { google: { 
                                                projectId: projectId,
                                                keyFilename: path.resolve('./config/sslcerts/totalberry.json'),
                                                bucketName: 'totalberry-images'}
                                         }  
                                  );
let localFileLocation = path.resolve('./test_image.jpg');

fileManager.upload('camera_138',localFileLocation)
            .then(function(result) {
                console.log(result.name);
            })
            .catch(function(err){
              console.log('error:', err);
            });
*/