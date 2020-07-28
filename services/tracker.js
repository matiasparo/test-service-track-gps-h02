
const h02 = require('../logic/h02');
const message =  require('../logic/message-brocker');
const {
    Track,
    TrackInfo
} = require('../models/tracker');
const fs = require('fs'),
    Log = require('log'),
    log = new Log('debug', fs.createWriteStream('my.log'));





const saveTrack = (data) => {
    try {
        if (data) {
            //TODO: implement log
            console.log(`Device ${data.imei} | cmd ${data.cmd} `);
            let dateSearch = data.gps.date;
            Track.findOne({
                device: data.imei,
                date: dateSearch
            }).exec((err, tracker) => {
                if (err)
                    return false;

                let _trackInf = new TrackInfo({
                    device: data.imei,
                    cmd: data.cmd,
                    data: JSON.stringify(data)
                })
                if (tracker) {

                    tracker.listTrackInfo.push(_trackInf);
                    tracker.update = Date.now();
                    tracker.battery = data.gps.batt;


                } else {
                    tracker = new Track({
                        device: data.imei,
                        date: data.gps.date,
                        update: Date.now(),
                        battery: data.gps.batt,
                        listTrackInfo: []
                    });
                }
                tracker.save((err, trackDB) => {
                    if (err) {
                        // TODO: implement log
                        return false;
                    }
                });
            });
        }
    } catch (e) {
        // TODO: implement log
        console.log(e);
    }
}

/* SECTION EVENTS */
h02.on('listening', function (listen) {
    console.log("listening");
    console.log(listen);
});
h02.on('disconnect', function (socket) {
    console.log('Disconnected device ' + socket.remoteAddress);
});
h02.on('connection', function (socket) {
    console.log('Connection from ' + socket.remoteAddress);
});
h02.on('timeout', function (socket) {
    console.log('Time-out from ' + socket.remoteAddress);
});
h02.on('fail', function (err) {
    console.log("Event Fail!");
    console.log(err);
});

h02.on('track', function (gpsData) {
    try {
        if (gpsData) {
            saveTrack(gpsData.data);
            message.emit('status_device', gpsData.data);
        }
    } catch (e) {
        // TODO: implement log
        console.log(e);
    }
});

const initServiceTracker = ()=>{
    h02.createServer({
        port: process.env.PORT_TCP_TRACKER,//,
        ip: process.env.IP_TCP_TRACKER
    });
}
module.exports = initServiceTracker;
