const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const dbConnect =require('./config/database');
dbConnect();
const app = express();
const userRoute = require("./routes/userRoute");
const adminRoute = require('./routes/adminRoute');
const nocache = require('nocache');
const errorHandler = require('./middlewares/errorHandler')

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(nocache());

app.set('view engine', 'ejs');

app.use('/',userRoute);
app.use('/admin',adminRoute)

// error Handle
app.use(errorHandler.error404);
app.use(errorHandler.error500);

app.listen(process.env.PORT,()=>{
    console.log('running...');
})
