const mongoose = require("mongoose");
const uniqueValidator  = require('mongoose-unique-validator');
let Schema = mongoose.Schema;



let deviceSchema = new Schema({
    device:{type:Number, require:[true,'device id is required'] },
    userId:{type:Number, required:[true, 'user_id is required'] },
    date_transmitted:{ type:Date, default:Date.now },
    date_assigned:{ type:Date, default:Date.now },
    enable:{ type:Boolean, "default":true },
    location: { type: { type: String }, coordinates: {type:[Number], index:'2dsphere'} },
    battery:{ type:Number }
});

/*
trackSchema.methods.toJSON = function(){
    let _user = this;
    let userObject = _user.toObject();
    delete userObject.password;

    return userObject;
}
*/


deviceSchema.plugin(uniqueValidator, {message:'{PATH} debe de ser unico'});

let DeviceInfo = mongoose.model( 'DeviceInfo', deviceSchema );

module.exports = DeviceInfo;