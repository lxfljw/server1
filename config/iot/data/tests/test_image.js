var path = require('path');
var FileManager = require('./FileManager.js');
let fileManager = new FileManager('google',
				{ google: { 
				       		projectId: 'totalberry-160201',
				         	keyFilename: path.resolve('./config/sslcerts/totalberry.json'),
				         	bucketName: 'totalberry-images'}
				         }  
				  );


let localFileLocation = '/Users/xisizhe/Desktop/2jdoq9s4kmal3kfr.jpg'

fileManager.upload('camera_136',localFileLocation)
            .then(function(result) {
              	console.log(result.name);
            })
            .catch(function(err){
             	console.log('error:', err);
            });

fileManager.getFilesByDate('camera_136', new Date())
            .then(function(files) {
              	console.log(files.length);
    tests          	for(var i in files)
              		console.log(   files[i] );

            })
            .catch(function(err){
             	console.log('error:', err);
            });