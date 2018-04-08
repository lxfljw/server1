var path = require('path');
var moment = require('moment');
var Promise = require('bluebird');

/*
interface FileManagerStrategy {
    upload(name, localFileLocation): Promise<any>;
    fetch(name): Promise<any>;
    delete(name: any): Promise<any>;
    getFilesByDate(name, date): Promise<any>;
    deleteGroupByDate(name, date): Promise<any>;
}
*/
/*
let fileManager = new FileManager('google', {
											projectId: 'totalberry-160201',
											keyFilename: path.resolve('./config/sslcerts/totalberry.json'),
											bucketName: 'totalberry-images'
										});
*/
class FileManager {
    //strategy: FileManagerStrategy;
    //fileManagerConfig: any;
    //type: string;
    constructor(type, fileManagerConfig) {
        this.type = type;
        this.fileManagerConfig = fileManagerConfig;

        switch (type) {
            case 'local':
                this.strategy = new LocalStorageStrategy(this.fileManagerConfig.local || {});
                break;
            case 'google':
                this.strategy = new GoogleStorageStrategy(this.fileManagerConfig.google || {});
                break;
            case 'aws':
                //this.strategy = new AmazonStorageStrategy(this.fileManagerConfig.aws || {});
                break;
            default:
                throw new Error(`${type} is not supported as a file storage strategy`);
        }
    }

    upload(name, localFileLocation) {
        return this.strategy.upload(name,localFileLocation);
    }

    fetch(name){
        return this.strategy.fetch(name);
    }

    delete(name){
        return this.strategy.delete(name);             
    }

    getFilesByDate(name, date){
        return this.strategy.getFilesByDate(name,date);
    }

    deleteGroupByDate(name, date){
        return this.strategy.deleteGroupByDate(name,date);          
    }    
}


class LocalStorageStrategy //implements FileManagerStrategy 
{
    //engine: any;
    //config: any;
    constructor(config) {
        this.config = config;
        this.engine = require('fs');
    }
    upload(config) {
        return new Promise((resolve, reject) => {
            this.engine.writeFile(config.path, config.data, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }
    delete(config) {
        return new Promise((resolve, reject) => {
            this.engine.unlink(config.path, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

class GoogleStorageStrategy //implements FileManagerStrategy 
{

    //engine: any;
    //storage: any;
    //config: any;
    //myBucket: any;

    constructor(config) {
        this.config = config;
        console.log('GoogleStorageStrategy   ',this.config);
		var engine = Promise.promisifyAll(require('@google-cloud/storage'));
		this.storage = engine({
		  projectId: this.config.projectId,
		  keyFilename: this.config.keyFilename
		})

		this.myBucket = this.storage.bucket(this.config.bucketName);

    }

	getPublicThumbnailUrlForItem(bucket, name){
	  return 'https://storage.googleapis.com/'+ bucket +'/'+name;
	} 


    upload(name, localFileLocation){
		let destination = name+'-'+ moment(new Date()).format("YYYYMMDD-HH:mm")+'.jpg';
        let self = this;
        console.log('google storage config',this.config.projectId,this.config.bucketName);
        console.log(name,localFileLocation,destination);

		return new Promise(function(resolve, reject){
	        self.myBucket.upload(localFileLocation, { public: true, destination: destination}, (err, file) => {
	            if(err){
	                return reject(err);
	            }
	            else {
	                return resolve(file);
	            }
	        })
		 });
    }

    fetch(name){
		let prefix = name;
        let self = this;

		return new Promise(function(resolve, reject){
			self.myBucket.getFiles({ prefix: prefix }, { public: true },  function(err, files) {	  
		            if(err){
		                return reject(err);
		            }
		            else {
		            	let _files = [];
		              	for(var i in files){
		              		_files.push( self.getPublicThumbnailUrlForItem( self.config.bucketName , files[i].name)  );
		              	}
		                return resolve(_files);
		            }	
			})
		 });
    }

	delete(name){
		let prefix = name;
        let self = this;
		return new Promise(function(resolve, reject){
			self.myBucket.getFiles({ prefix: prefix }, { public: true },  function(err, files) {	  
		            if(err){
		                return reject(err);
		            }
		            else {
		                return resolve(files);
		            }	
			})
		 });			  
	}


    getFilesByDate(name, date){
		let prefix = name +'-'+ moment(date).format("YYYYMMDD");
    	return this.fetch(prefix);
    }

	deleteGroupByDate(name, date){
		let prefix = name +'-'+ moment(date).format("YYYYMMDD");
		return this.delete(prefix);			  
	}

}

module.exports = FileManager;