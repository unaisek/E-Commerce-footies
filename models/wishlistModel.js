const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user : {
        type :String,
        required :true
    },
    userName :{
        type :String,
        required :true
    },
    products :[{
        productId : {
            type :mongoose.Types.ObjectId,
            ref :"product",
            required :true
        },
        addedAt :{
            type :Date,
            default :Date.now
        }
    }]
});

const wishlistModel = mongoose.model("wishlist", wishlistSchema);
module.exports = wishlistModel;