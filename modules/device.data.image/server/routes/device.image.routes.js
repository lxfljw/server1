'use strict';

var adminPolicy = require('../policies/device.image.policy'),
    deviceImageController  = require('../controllers/user.image.controller');

var auth = require('../../../users/server/controllers/users/users.authentication.server.controller');




module.exports = function (app) {
 
    //# post data
    app.route('/v1/device/:device_id/images')//.all(auth.isAuthenticatedByJWT)
                                          .post(deviceImageController.saveImage );

    app.route('/device/:device_id/images').post(deviceImageController.saveImage );                                      
    
    app.route('/v1/devices/:device_id/images')
                                                .get(deviceImageController.getImages  );




};
