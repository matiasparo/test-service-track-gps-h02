const Device = require('../models/device');
const EventEmitter = require('events').EventEmitter;
const message = new EventEmitter();



message.on('status_device', (data) => {

    try {
        if (data) {
            let deviceData = {
                device: data.imei,
                battery: data.gps.batt
            };

            let location = {
                type: 'Point',
                coordinates: [data.geo.longitude, data.geo.latitude]
            };

            //search for the device associated with the user that is active and save its status
            Device.findOne({
                device: deviceData.device,
                enable: true
            }, (err, deviceDB) => {

                //TODO: implement log
                if (err) return err;

                deviceDB.battery = device.battery;
                deviceDB.date_transmitted = Date.now();
                deviceDB.location = location;
                deviceDB.save(function (err, updatedDevice) {
                    //implementar log
                    if (err) return err;
                });

            });
        }
    } catch (err) {
        //implementar log
        console.log(err);
    }
});




module.exports = message;