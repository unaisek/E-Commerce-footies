const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    status: {
        type: Boolean,
        default:true,
        required: true
    },
    createdAt: {
        type: Date,
        default:Date.now
    }
    

});

const productModel = mongoose.model('product', productSchema);
module.exports = productModel;
