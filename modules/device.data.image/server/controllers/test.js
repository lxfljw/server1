

var path = require('path');
var fs = require('fs');
var moment = require('moment');

var dateTime = new Date();
console.log(   moment(dateTime).format("YYYYMMDD-HH:mm") );

var Promise = require('bluebird');
var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));
var storage = GoogleCloudStorage({
  projectId: 'totalberry-160201',
  keyFilename: './totalberry.json'
})


var bucket_name = 'totalberry-images';

var myBucket = storage.bucket(bucket_name);
let localFileLocation = '/Users/xisizhe/Desktop/2jdoq9s4kmal3kfr.jpg'


// https://console.cloud.google.com/storage/browser/totalberry-images/?project=totalberry-160201

upload('camera_136',localFileLocation)
            .then(function(result) {
              	console.log(result.name);
            })
            .catch(function(err){
             	console.log('error:', err);
            });

getImagesByDate('camera_136', new Date())
            .then(function(files) {
              	console.log(files.length);
              	for(var i in files)
              		console.log(   getPublicThumbnailUrlForItem( bucket_name , files[i].name)  );

            })
            .catch(function(err){
             	console.log('error:', err);
            });


function getPublicThumbnailUrlForItem(bucket, name){
  return 'https://storage.googleapis.com/'+ bucket +'/'+name;

}        

function upload(device_id, localFileLocation){

	let destination = device_id+'-'+ moment(new Date()).format("YYYYMMDD-HH:mm")+'.jpg';

	return new Promise(function(resolve, reject){

        myBucket.upload(localFileLocation, { public: true, destination: destination}, (err, file) => {
            if(err){
                return reject(err);
            }
            else {
                return resolve(file);
            }
        })

	 });
}


function getImagesByDate(device_id , date){
	let prefix = device_id +'-'+ moment(date).format("YYYYMMDD");

	return new Promise(function(resolve, reject){

		myBucket.getFiles({ prefix: prefix }, { public: true },  function(err, files) {	  
			    // file saved
	            if(err){
	                return reject(err);
	            }
	            else {
	                return resolve(files);
	            }	
		})
	 });			  
}

function deleteSingleByName(name){
	let prefix = name;

	return new Promise(function(resolve, reject){

		myBucket.getFiles({ prefix: prefix }, { public: true },  function(err, files) {	  
			    // file saved
	            if(err){
	                return reject(err);
	            }
	            else {
	                return resolve(files);
	            }	
		})
	 });			  
}

function deleteGroupByDate(device_id , date){
	let prefix = device_id +'-'+ moment(date).format("YYYYMMDD");

	return new Promise(function(resolve, reject){

		myBucket.deleteFiles({ prefix: prefix }, { public: true },  function(err, files) {	  
			    // file saved
	            if(err){
	                return reject(err);
	            }
	            else {
	                return resolve(files);
	            }	
		})
	 });			  
}