const Banner = require('../models/bannerModel');

const loadBannerList = async(req,res,next)=>{
    try {

        const bannerData = await Banner.find({});
        res.render('bannerList',{bannerData});
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// add banner page

const loadAddBanner = async(req,res,next)=>{
    try {

        res.render('addBanner');
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// add new banner

const addNewBanner = async(req,res,next)=>{
    try {

        const images = req.file.filename;
        const{ bannerTitle, description } = req.body
        const banner = new Banner({
            bannerTitle,
            description,
            images
        })

        const bannerData = await banner.save();
        if(bannerData){
            res.redirect('/admin/banner')
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load edit banner page

const loadEditBanner = async(req,res,next)=>{
    try {

        const bannerId = req.query.id;
        const bannerData = await Banner.findById({_id:bannerId});
        if(bannerData){
            res.render('editBanner',{banner:bannerData})
        } else {
            res.redirect('/admin/dashboard');
        }        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// edit update banner

const updateBanner = async(req,res,next)=>{
    try {

        const bannerId = req.query.id;
        const images = req.file.filename;
        const{bannerTitle, description} = req.body;
        const bannerData = await Banner.findOneAndUpdate({ _id: bannerId },{ $set : { bannerTitle, description , images}} );
        if(bannerData){
            res.redirect('/admin/banner')
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// unlist banner 

const doUnlistBanner = async(req,res,next)=>{
    try {

        const bannerId = req.query.id;
        const bannerData = await Banner.findOneAndUpdate({ _id: bannerId }, { $set: { status: false }});
        if(bannerData){
            res.redirect('/admin/banner');
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// listed banner


const doListBanner = async (req,res,next) => {
    try {

        const bannerId = req.query.id;
        const bannerData = await Banner.findOneAndUpdate({ _id: bannerId }, { $set: { status: true } });
        if (bannerData) {
            res.redirect('/admin/banner');
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

module.exports ={
    loadBannerList,
    loadAddBanner,
    addNewBanner,
    loadEditBanner,
    updateBanner,
    doUnlistBanner,
    doListBanner
}