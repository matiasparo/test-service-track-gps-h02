const jwt = require('jsonwebtoken');

//VERIFICAR TOKENS
let verifyTokens = (req, res, next) => {
    if (req.headers.authorization.trim() != '') {
        let arr = req.headers.authorization.split(' ');
        let token = arr[1];
        jwt.verify(token, process.env.SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    err: {
                        message: "Token invalid"
                    }
                });
            }
            req.userId = decoded.unique_name;
            req.userRole = decoded.role;
            next();
        });
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: "Token invalid"
            }
        });
    }
};


module.exports = {
    verifyTokens    
}