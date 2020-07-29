const net = require('net');
const EventEmitter = require('events').EventEmitter;
const h02 = new EventEmitter();
const { getGpsFromTowerData } = require('./gps');


// device data
const specs = [
    function (raw, callback) {
        // 1203292316,0031698765432,GPRMC,211657.000,A,5213.0247,N,00516.7757,E,0.00,273.30,290312,,,A*62,F,imei:123456789012345,123
        // *HQ,4209950057,V1,035522,A,1321.1457,N,10351.0798,E,000.00,000,240317,BFFFFBFF,456,06,0,0,6#
        // *HQ,4209950057,#
        // *HQ,4209950057,V19,035522,A,1321.1457,N,10351.0798,E,000.00,000,240317,,,8985506081694161822F,BFFFFBFF# 
        let result = null;
        let str = [];
        let datetime = '';
        let gpsdate = '';
        let gpstime = '';

        try {
            raw = raw.trim();
            str = raw.split(',');

            if (str.length === 18 && str[2] === 'V1') {
                datetime = str[11].replace(/([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, y, m, d, h, i) {
                    return '20' + y + '-' + m + '-' + d + ' ' + h + ':' + i;
                });

                gpsdate = str[11].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, d, m, y) {
                    return '20' + y + '-' + m + '-' + d;
                });

                gpstime = str[3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s0, h, i, s) {
                    return h + ':' + i + ':' + s;
                });

                allMasks = h02.getBitMasks(str[12]);

                result = {
                    raw: raw,
                    cmd: str[2],
                    datetime: datetime,
                    phone: str[1],
                    gps: {
                        date: gpsdate,
                        time: gpstime,
                        //signal: str [15] === 'F' ? 'full' : 'low', // from binary TODO
                        fix: str[4] === 'A' ? 'active' : 'invalid',
                        batt: str[str.length - 1].replace("#",'')
                    },
                    geo: {
                        latitude: h02.fixGeo(str[5], str[6]),
                        longitude: h02.fixGeo(str[7], str[8]),
                        bearing: parseInt(str[10], 10)
                    },
                    speed: {
                        knots: Math.round(str[9] * 1000) / 1000,
                        kmh: Math.round(str[10] * 1.852 * 1000) / 1000,
                        mph: Math.round(str[10] * 1.151 * 1000) / 1000
                    },
                    status: {
                        'retention': {
                            'power_cut': false
                        },
                        'gps': {
                            'vibration': false,
                            'power_cut': false,
                            'shock': false,
                            'low_battery': allMasks[1][7]
                        },
                        'vehicle': {
                            'armed': false,
                            'ac': false
                        },
                        'alarm': {
                            'sos': false,
                            'speed': false,
                            'drop': allMasks[3][1] === false ? true : false
                        }
                    },
                    rawBitMasks: allMasks,
                    imei: str[1]
                    //checksum: h02.checksum (raw) // TODO No checksum info
                };
                callback(result);
            } else {
                if (str[2] === 'NBR') { // it comes without gps signal with data from the most near telephone tower
                    //*HQ,4109224553,NBR,223221,748,7,0,7,8311,9905,41,8311,9967,21,8311,8221,15,8311,8160,15,8311,9906,14,8311,9076,13,8311,8161,13,121118,FFFFF9FF,5#
                    datetime = str[str.length - 3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, y, m, d, h, i) {
                        return '20' + y + '-' + m + '-' + d + ' ' + h + ':' + i;
                    });

                    gpsdate = str[str.length - 3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, d, m, y) {
                        return '20' + y + '-' + m + '-' + d;
                    });

                    gpstime = str[3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s0, h, i, s) {
                        return h + ':' + i + ':' + s;
                    });

                    allMasks = h02.getBitMasks(str[21]);


                    result = {
                        raw: raw,
                        cmd: str[2],
                        datetime: datetime,
                        phone: str[1],
                        gps: {
                            date: gpsdate,
                            time: gpstime,
                            //signal: str [15] === 'F' ? 'full' : 'low', // from binary TODO
                            fix: str[4] === 'A' ? 'active' : 'invalid',
                            batt: str[str.length - 1].replace("#",'')
                        },
                        geo: {
                            /*latitude: h02.fixGeo(str[5], str [6]),
                            longitude: h02.fixGeo(str[7], str [8]),
                            bearing: parseInt(str[10], 10)*/
                        },
                        speed: {
                            knots: 0,
                            kmh: 0,
                            mph: 0
                        },
                        status: {
                            'retention': {
                                'power_cut': false
                            },
                            'gps': {
                                'vibration': false,
                                'power_cut': false,
                                'shock': false,
                                'low_battery': allMasks[1][7]
                            },
                            'vehicle': {
                                'armed': false,
                                'ac': false
                            },
                            'alarm': {
                                'sos': false,
                                'speed': false,
                                'drop': allMasks[3][1] === false ? true : false
                            }
                        },
                        rawBitMasks: allMasks,
                        imei: str[1],
                        //checksum: h02.checksum (raw) // TODO No checksum info
                    };
                    //get coordinates according to movile line
                    getGpsFromTowerData(str[4], str[5], str[8], str[9]).then((locationGPS)=>{
                        if(locationGPS.longitude){
                            result.geo = {
                                latitude: locationGPS.latitude,
                                longitude: locationGPS.longitude
                            }
                        }
                        callback(result);
                    });
                    console.log("es un NBR");
                } else if (str[2] === 'v19') {
                    console.log("es un V19");
                    //*HQ,4109224553,V19,183752,A,3454.7646,S,05610.7135,W,000.50,000,191118,,094339055,89598071102043108039,FFFFFBFF#
                    datetime = str[11].replace(/([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, y, m, d, h, i) {
                        return '20' + y + '-' + m + '-' + d + ' ' + h + ':' + i;
                    });
    
                    gpsdate = str[11].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s, d, m, y) {
                        return '20' + y + '-' + m + '-' + d;
                    });
    
                    gpstime = str[3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function (s0, h, i, s) {
                        return h + ':' + i + ':' + s;
                    });
    
                    allMasks = h02.getBitMasks(str[15]);
    
                    result = {
                        raw: raw,
                        cmd: str[2],
                        datetime: datetime,
                        phone: str[1],
                        gps: {
                            date: gpsdate,
                            time: gpstime,
                            //signal: str [15] === 'F' ? 'full' : 'low', // from binary TODO
                            fix: str[4] === 'A' ? 'active' : 'invalid',
                            batt: str[14] //
                        },
                        geo: {
                            latitude: h02.fixGeo(str[5], str[6]),
                            longitude: h02.fixGeo(str[7], str[8]),
                            bearing: parseInt(str[10], 10)
                        },
                        speed: {
                            knots: Math.round(str[9] * 1000) / 1000,
                            kmh: Math.round(str[10] * 1.852 * 1000) / 1000,
                            mph: Math.round(str[10] * 1.151 * 1000) / 1000
                        },
                        status: {
                            'retention': {
                                'power_cut': false
                            },
                            'gps': {
                                'vibration': false,
                                'power_cut': false,
                                'shock': false,
                                'low_battery': allMasks[1][7]
                            },
                            'vehicle': {
                                'armed': false,
                                'ac': false
                            },
                            'alarm': {
                                'sos': false,
                                'speed': false,
                                'drop': allMasks[3][1] === false ? true : false
                            }
                        },
                        rawBitMasks: allMasks,
                        imei: str[1]
                        //checksum: h02.checksum (raw) // TODO No checksum info
                    };
                    callback(result);
                }
            }
        } catch (e) {
            callback(e);
        }
    }
];

// defaults
h02.settings = {
    ip: '0.0.0.0',
    port: 0,
    connections: 10,
    timeout: 10
};


// Emit event
h02.event = (name, value) => {
    h02.emit(name, value);
    h02.emit('log', name, value);
};

// Catch uncaught exceptions (server kill)
process.on('uncaughtException', function (err) {
    console.log(err)
    var error = new Error('uncaught exception');

    error.error = err;
    h02.event('error', error);
});

// Create server
h02.createServer = function (vars) {
    var key;

    // override settings
    if (typeof vars === 'object' && Object.keys(vars).length >= 1) {
        for (key in vars) {
            h02.settings[key] = vars[key];
        }
    }

    // start server
    h02.server = net.createServer();

    // maximum number of slots
    h02.server.maxConnections = h02.settings.connections;

    // server started
    h02.server.on('listening', function () {
        h02.event('listening', h02.server.address());
    });

    // inbound connection
    h02.server.on('connection', function (socket) {
        var connection = h02.server.address();

        connection.remoteAddress = socket.remoteAddress;
        connection.remotePort = socket.remotePort;

        h02.event('connection', connection);
        socket.setEncoding('utf8');

        if (h02.settings.timeout > 0) {
            socket.setTimeout(parseInt(h02.settings.timeout * 1000, 10));
        }

        socket.on('timeout', function () {
            h02.event('timeout', connection);
            socket.destroy();
        });

        socket.on('data', function (data) {
            var gps = {};
            var err = null;

            data = data.trim();
            h02.event('data', data);

            if (data !== '') {
                h02.parse(data, (gps)=>{
                    if (gps) {
                        if(gps.cmd != 'V19'){
                            h02.event('track', {
                                'data': gps,
                                'socket': socket
                            });
                        }
                    } else {
                        err = new Error('Cannot parse GPS data from device');
                        err.reason = err.message;
                        err.input = data;
                        err.connection = connection;
                        h02.event('fail', err);
                    }
                });                
            }
        });

        socket.on('close', function (hadError) {
            connection.hadError = hadError;
            h02.event('disconnect', connection);
        });

        // error
        socket.on('error', function (error) {
            var err = new Error('Socket error');

            err.reason = error.message;
            err.socket = socket;
            err.settings = h02.settings;

            h02.event('error', err);
        });
    });

    h02.server.on('error', function (error) {
        var err = new Error('Server error');

        if (error === 'EADDRNOTAVAIL') {
            err = new Error('IP or port not available');
        }

        err.reason = error.message;
        err.input = h02.settings;

        h02.event('error', err);
    });

    // Start listening
    h02.server.listen(h02.settings.port, h02.settings.ip);

    return h02;
};

// Graceful close server
h02.closeServer = function (callback) {
    if (!h02.server) {
        callback(new Error('server not started'));
        return;
    }

    h02.server.close(callback);
};

// Parse GPRMC string
h02.parse = (raw, callback) => {
    var data = null;
    var i = 0;

    while (data === null && i < specs.length) {
        data = specs[i](raw, callback);
        i++;
    }    
    
};

// Clean geo positions, with 6 decimals
h02.fixGeo = function (one, two) {
    var minutes = one.substr(-7, 7);
    var degrees = parseInt(one.replace(minutes, ''), 10);

    one = degrees + (minutes / 60);
    one = parseFloat((two === 'S' || two === 'W' ? '-' : '') + one);
    return Math.round(one * 1000000) / 1000000;
};

//aca setea el estado del dispositivo
h02.getBitMasks = function (hex) {
    theByte = 0, theBitMask = {}, theBitMaskArray = [];
    for (var i = hex.length; i > 0; i -= 2) {
        var v = parseInt(hex.substr(i - 2, 2), 16);
        theBitMaskArray = v.toString(2).split('');
        theBitMask[theByte] = {};
        for (var j = 0; j < theBitMaskArray.length; j++) {
            if (theBitMaskArray[j] === '0') {
                // non sense but 0 means positive (see h02 doc)
                theBitMask[theByte][j] = true;
            } else {
                theBitMask[theByte][j] = false;
            }
        }
        theByte++;
    }
    return theBitMask;
}

// Check checksum in raw string
h02.checksum = function (raw) {
    var str = raw.trim().split(/[,*#]/);
    var strsum = parseInt(str[15], 10);
    var strchk = str.slice(2, 15).join(',');
    var check = 0;
    var i;

    for (i = 0; i < strchk.length; i++) {
        check ^= strchk.charCodeAt(i);
    }

    check = parseInt(check.toString(16), 10);
    return (check === strsum);
};

// ready
module.exports = h02;