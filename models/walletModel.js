const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Types.ObjectId,
        ref:'user',
        required: true
    },
    walletAmount:{
        type: Number
    },    
    wallet:[{
        amount:{
            type: Number,
            required: true
        },
        transactionType:{
            type: String,
            required: true
        },
        date:{
            type: Date,
            default:Date.now(),
        }        
    }]
})
const walletModel = mongoose.model('wallet', walletSchema);
module.exports = walletModel;