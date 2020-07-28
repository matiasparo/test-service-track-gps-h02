const {
    verifyTokens,
    verifyAdminRole
} = require('./../middlewares/auth');
const express = require("express");
let app = express();

const Device = require('../models/device');


app.get('/get-device-assigned', verifyTokens, (req, res) => {
    
    let idUser = req.userId;

    if (idUser) {
        Device.find({
                enable: true,
                userId: idUser
            })
            .exec((err, device) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (device.length > 0) {
                    res.json({
                        ok: true,
                        device: device[0]
                    });
                } else {
                    res.json({
                        ok: false,
                        err: {
                            message: "No existe un dispositivo asociado"
                        }
                    })
                }

            });
    } else {
        return res.status(401).json({
            ok:false,
            err:{
                message:"Problemas de autorizacion"
            }
        });
    }
});


//asigno un dispositivo a un usuario
app.post('/device-user-associated', [verifyTokens], (req, res) => {

    let body = req.body;
    let device = new Device({
        device: body.device,
        userId: body.userId,
        date_transmitted: Date.now(),
        date_assigned: Date.now(),
        enable: true,
        battery: 0,
        location: {
            type: "Point",
            coordinates: [-55.767859, -34.737474]
        }

    })

    device.save((err, deviceDB) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err: {
                        message: err.message
                    }
                });
        }

        res.json({
            ok: true,
            deviceDB
        });

    });


});



module.exports = app;