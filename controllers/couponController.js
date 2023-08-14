const Coupon = require('../models/couponModel');

const showCouponList = async(req,res,next)=>{
    try {
        
        const couponData = await Coupon.find({});
        res.render('couponList',{coupons:couponData});

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const loadAddCoupon =async(req,res,next)=>{

    try {

        res.render('addCoupon');
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}
const addNewCoupon = async(req,res,next)=>{
    try {

        const { couponName, discountType, discountAmount, minCartAmount, maxDiscAmount, expired} = req.body
        const couponData = await Coupon.findOne({name:couponName});
        if (!couponData){
            const coupon = new Coupon ({
                couponName,
                discountType, 
                discountAmount, 
                minCartAmount, 
                maxDiscAmount, 
                expired
            });
            const newCoupon= await coupon.save();
            if (newCoupon) {
                res.redirect('/admin/coupon');
            }
        } else {
           res.render('addCoupon',{message:"adding coupon is failed"})
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }

    
};

const loadEditCoupon = async(req,res,next)=>{
    try {

        const couponId =  req.query.id;
        const couponData = await Coupon.findOne({_id:couponId});
        res.render('editCoupon',{coupon:couponData});
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const updateCoupon = async(req,res,next)=>{
    try {
        const orderId = req.query.id;
        // const { couponName, discountType, discountAmount, minCartAmount, maxDiscAmount, expired } = req.body
        const updatedData =  await Coupon.findByIdAndUpdate(orderId,{ $set: req.body});
        if(updatedData){
            res.redirect('/admin/coupon')
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// user apply Coupon

const applyCoupon = async(req,res,next)=>{
    try {

        const code = req.body.code;
        const amount = Number(req.body.amount);
        const userExist = await Coupon.findOne({ couponName: code, usedUsers: { $in: [req.session.user_id]}});
        if(userExist){
            res.json({user: true});
        } else {
            const couponData = await Coupon.findOne({ couponName: code });
            if (couponData){
                if(couponData.status == false){
                    res.json({ status:true });
                } else {
                    if(couponData.expired <= new Date()){
                        res.json({ date: true });
                    } else {
                        if(couponData.minCartAmount >= amount){
                            res.json({cartAmount :true});
                        } else {
                            if (couponData.discountType == "Fixed Amount"){
                                const discAmount = couponData.discountAmount;
                                let disTotal;
                                if(discAmount > amount){
                                     disTotal = 0
                                }else{
                                    disTotal = Math.round(amount - discAmount);
                                }
                                return res.json({ amountkey: true, discAmount, disTotal, couponName: code })
                            } else {
                                const perAmount = (amount * couponData.discountAmount) /100;
                                if(perAmount <= couponData.maxDiscAmount){
                                    const discAmount = perAmount;
                                    // const disTotal = Math.round( amount - discAmount);
                                    let disTotal;
                                    if (discAmount > amount) {
                                        disTotal = 0
                                    } else {
                                        disTotal = Math.round(amount - discAmount);
                                    }
                                    return res.json({ amountKey: true, discAmount, disTotal, couponName: code });

                                }else {
                                    const discAmount = couponData.maxDiscAmount;
                                    // const disTotal = Math.round(amount - discAmount);
                                    let disTotal;
                                    if (discAmount > amount) {
                                        disTotal = 0
                                    } else {
                                        disTotal = Math.round(amount - discAmount);
                                    }
                                    return res.json({ amountKey: true, discAmount, disTotal, couponName: code });
                                }
                            }
                        }

                    }
                }
            } else{
                res.json({invalid: true});
            }
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}
module.exports = {
    showCouponList,
    loadAddCoupon,
    addNewCoupon,
    loadEditCoupon,
    updateCoupon,
    applyCoupon
    
}