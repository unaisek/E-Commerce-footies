const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
const otpModel = mongoose.model('otp', categorySchema);
module.exports = categoryModel;