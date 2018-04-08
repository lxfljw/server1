'use strict';

var chalk = require('chalk'),
  	path = require('path'),
  	mongoose = require('mongoose'),
    logger = require(path.resolve('./config/lib/logger.js'));  

const config = require(path.resolve('./config/env/default.js'));

const DataTransformer = require('./utils/DataTransformer.js');
const dataSchema = require('./models/deviceDataSchema.js');
const PubSubLayer = require('../utils/PubSubLayer');

const FileManager = require('../controllers/FileManager');

class DataLayer extends PubSubLayer{

	constructor(url) {

		super(url);

		var self = this;

		this._dataTransformer = new DataTransformer();
		this._deviceDataModel = mongoose.model('DeviceDataModel', new dataSchema()  );
		this._deviceDataModel.init('test', {interval: 5,verbose: false});	

		this._fileManager = new FileManager('google',
          { google: { 
                  projectId: 'totalberry-160201',
                  keyFilename: path.resolve('./config/sslcerts/totalberry.json'),
                  bucketName: 'totalberry-images'}
                 }  
          );

		this.subscribeTopics();

	}

	subscribeTopics(){
		var self = this;

		this._client.event.subscribe('device/measurement', msg => {
			logger.debug('DataLayer  subscribe measurement -------------------------------------',msg);
			var device = msg.device, data = msg.data;

			self.storeData(device.device_id, data);
		})

	}

	storeData( device_id, message){
	    //console.log(chalk.green('lights.storeData'), message.temp, message.humi, message.light );  
		this._deviceDataModel.push(device_id, [ message.temp,message.humi, message.light ], false, {}, function(err, docs){
		    if(err) {
		        logger.debug(chalk.red('lights.storeData'),err);
		    }else{
		        logger.info(chalk.green('device.data.senor lights.storeData'), docs.statistics.i, docs.updatedAt, docs.actor,message.temp, message.humi, message.light );   
		    }
		});
	}

	get deviceDataModel(){
		return this._deviceDataModel;
	}	

	get dataTransformer(){
		return this._dataTransformer;
	}

	get fileManager(){
		return this._fileManager;
	}

}

module.exports = DataLayer;	