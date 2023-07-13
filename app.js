const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const dbConnect =require('./config/database');
dbConnect();
const app = express();
const userRoute = require("./routes/userRoute");
const adminRoute = require('./routes/adminRoute');
const nocache = require('nocache');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(nocache());


app.use('/',userRoute);
app.use('/admin',adminRoute)


app.listen(process.env.PORT,()=>{
    console.log('running...');
})
