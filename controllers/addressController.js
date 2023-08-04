const Address = require('../models/addressModel');
const User = require('../models/userModel');

const loadAddAddress = async(req ,res,next)=>{
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
        next(error);
    }
}

// user profile add address

const addNewAddress = async(req,res,next)=>{
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
                res.redirect('/checkout');
            } else {
                req.redirect('/checkout');
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
                res.redirect('/checkout');
            } else {
                res.render('addAddress')
            }
        }
    } catch (error) {
       console.log(error.message);
        next(error); 
    }
}

const loadEditAddress =  async(req,res,next)=>{
    try {
        const userId = req.session.user_id;
        const addressId = req.query.id;
        const addressData = await Address.findOne({ userId: userId ,"addresses._id":addressId})
        const aData = addressData.addresses.find((addr) => addr._id.toString()=== addressId);
        res.render("editAddress", { address: aData ,loggedIn :userId})       
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const doEditAddress = async (req, res, next) => {
    try {
        const userId = req.session.user_id;
        console.log(req.body);
        const { userName, mobile, altMobile, address, city, state, pincode, landmark } = req.body;

         const updateData = await Address.findOneAndUpdate({ userId:userId, "addresses._id": req.query.id }, {
                $set: {
                    "addresses.$.userName": userName,
                    "addresses.$.mobile": mobile,
                    "addresses.$.alternativeMob": altMobile, 
                    "addresses.$.address": address,
                    "addresses.$.city": city,
                    "addresses.$.state": state,
                    "addresses.$.pincode": pincode,
                    "addresses.$.landmark": landmark,
                }
        });
        if(updateData){

            res.redirect('/checkout');
        } else {
            console.log("log not updated");
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
};


module.exports = {
    loadAddAddress,
    addNewAddress,
    loadEditAddress,
    doEditAddress

}