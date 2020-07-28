const api = require('mobile-locator');
require('../config/config');

const locate = api('google', { key: process.env.API_KEY_GOOGLE });
 

const getGpsFromTowerData = async ( mcc, mnc, lac, cid) => {
    
    return locate({ mcc, mnc, lac, cid });
}



module.exports = {
    getGpsFromTowerData
}