const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    deliveryAddress : {
        type :String,
        required :true
    },
    userId :{
        type :String,
        required :true
    },
    userName: {
        type: String,
        required: true
    },
    paymentMethod :{
        type :String,
        required :true
    },
    paymentId :{
        type :String
    },
    products :[{
        productId :{
            type: mongoose.Types.ObjectId,
            ref: 'product',
            required: true
        },
        count :{
            type :Number
        },
        productPrice : {
            type :Number,
            required :true
        },
        totalPrice : {
            type :Number
        }
    }],
    amount :{
        type :Number,
        required :true
    },
    totalAmount:{
        type :Number,
        required : true
    },
    date :{
        type :Date
    },
    status :{
        type :String
    },
    returnStatus: {
        type: String,
        default: "No Return"
    },
    returnReason:{
        type: String,
        default: null
    },
    orderWallet :{
        type :Number
    }
    },
    {timestamps:true}
);

const OrderModel = mongoose.model('order', orderSchema);
module.exports = OrderModel;