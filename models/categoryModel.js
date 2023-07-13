const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({

    categoryName:{
        type: String,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
const categoryModel = mongoose.model('category', categorySchema);
module.exports = categoryModel;