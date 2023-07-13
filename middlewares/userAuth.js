const User = require('../models/userModel');
const isLogin = async (req, res, next) => {
    try {
        
        if (req.session.user_id) {
            const user = await User.findOne({ _id: req.session.user_id });
            if(user && !user.is_blocked){
                next();
            } else{
                res.status(403).send("Access denied. Your account has been blocked.");
            }
        } else {
            res.redirect('/login');
        }
       

    } catch (error) {
        console.log(error.messagge);
    }
  
}

const isLogout = (req, res, next) => {
    if (req.session.user_id) {
        res.redirect('/');
    }
    next();
}

module.exports = {
    isLogin,
    isLogout
}