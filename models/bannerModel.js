const mongoose = require('mongoose');
const bannerSchema  = new mongoose.Schema({
    bannerTitle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: String,
        reqired: true
    },
    status:{
        type: Boolean,
        default: true
    },
    created:{
        type: Date,
        default: Date.now()
    },
    updated:{
        type:Date,
        default: Date.now()
    }
});
const bannerModel = mongoose.model('banner',bannerSchema);
module.exports = bannerModel