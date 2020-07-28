const { verifyTokens} = require('./../middlewares/auth');
const message = require('./../logic/message-brocker');
const express = require("express");
let app = express();
const {
    Track,
    TrackInfo
} = require('../models/tracker');

const DeviceInfo = require('../models/device');



app.get('/get-status-device/:imei/:date', verifyTokens, (req, res) => {
    let imei = parseInt(req.params.imei);
    let dateSearch = req.params.date;
    console.log(`Imei: ${imei} - SearchData: ${dateSearch}`);
    Track.findOne({ device: imei, date: dateSearch })    
    .exec((err, trackerDB) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        
        if(trackerDB){
            return res.json({
                ok:true,
                tracker:{
                    device: trackerDB.device, 
                    tracker:trackerDB.date,
                    update:trackerDB.update,
                    battery: trackerDB.battery,
                    data: trackerDB.listTrackInfo
                }
            });
        }

        return res.status(400).json({
            ok:false,
            msg:"no hay nada!"
        })
    });
});

app.get('/get-device', verifyTokens,(req,res) => {
    Track.find({}, 'device date update battery')
    .exec((err, tracker)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        return res.json({
            ok:true,
            tracker
        });

    });
});


app.get('/test-message', (req,res)=>{
    setTimeout(()=>{
        message.emit('status_device', {status:'ok!'});
    },3000);
    res.json();
});



module.exports = app;