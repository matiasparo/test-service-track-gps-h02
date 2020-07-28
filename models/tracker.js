const mongoose = require("mongoose");
const uniqueValidator  = require('mongoose-unique-validator');
let Schema = mongoose.Schema;



let trackInfoSchema = new Schema({
    device:{type:Number, require:[true,'Device id required'] },
    cmd:{type:String, required:[true, 'cmd is required'] },
    data:{type:String}
});

let trackSchema = new Schema({
    device:{ type:Number,require:[true]},
    date: {type:String},
    update:{type:Date, default:Date.now},
    battery:{type:Number},
    listTrackInfo:[trackInfoSchema]
})

/*
trackSchema.methods.toJSON = function(){
    let _user = this;
    let userObject = _user.toObject();
    delete userObject.password;

    return userObject;
}
*/


trackSchema.plugin(uniqueValidator, {message:'{PATH} debe de ser unico'});

let TrackInfo = mongoose.model( 'TrackInfo', trackInfoSchema );
let Track = mongoose.model( 'Track', trackSchema );

module.exports = { TrackInfo, Track};