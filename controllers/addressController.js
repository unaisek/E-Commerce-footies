const Address = require('../models/addressModel');
const User = require('../models/userModel');

const loadAddAddress = async(req,res)=>{
    try {
        if(req.session.user_id){
            const loggedIn = req.session.user_id;
            // const userData = await User.findOne({_id :user_id})
            if(req.session.user_id){
                res.render('addAddress',{loggedIn});
            } else {
                req.redirect('/');
            }
        } else {
            res.redirect('/login');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// user profile add address

const addNewAddress = async(req,res)=>{
    try {

        const userId = req.session.user_id;
        const {userName,mobile,altMobile,address,city,state,pincode,landmark} = req.body
        const addressData = await Address.findOne({userId :userId});
        if(addressData){
            const updatedAddress = await Address.updateOne(
                { userId: userId },
                {
                    $push: {
                        addresses: {
                            userName: userName,
                            mobile: mobile,
                            alternativeMob: altMobile,
                            address: address,
                            city: city,
                            state: state,
                            pincode: pincode,
                            landmark: landmark
                        }
                    }
                }
            );
            if (updatedAddress){
                res.redirect('addAddress');
            } else {
                req.redirect('addAddress');
            }

        } else {
            const userAdress = new Address({
                userId :userId,
                addresses :[{
                    userName: userName,
                    mobile: mobile,
                    alternativeMob: altMobile,
                    address: address,
                    city: city,
                    state: state,
                    pincode: pincode,
                    landmark: landmark
                }]
            });

            const addressData = await userAdress.save();
            if(addressData){
                res.redirect('/addAddress');
            } else {
                res.redirect('/addAddress');
            }
        }
    } catch (error) {
       console.log(error.message); 
    }
}

module.exports = {
    loadAddAddress,
    addNewAddress
}