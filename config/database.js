const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async()=>{
   try {
       await mongoose.connect(process.env.DB_URI);
       console.log("Database connected..");
   } catch (error) {
    console.log(error.message);
    
   }
}
module.exports = dbConnect;