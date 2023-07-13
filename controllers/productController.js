const { error } = require('console');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const fs = require("fs");
const path = require("path");
const sharp = require('sharp');




// user home page
const loadProductList  = async(req,res)=>{
    try {
        const productData = await Product.find({})
        res.render('productList', { products: productData });
        
    } catch (error) {
        console.log(error.message);
    }
}


// loading add product page
const loadAddProduct = async (req, res) => {
    try {
        const catDAta = await Category.find({})
        res.render('addProduct', { category: catDAta });

    } catch (error) {
        console.log(error.message);
    }
}

// add products

const addProduct = async(req,res)=>{
    try {
        const images = [];
        for (let i = 0; i < req.files.length; i++) {
            images[i] = req.files[i].filename
        }
        // const resizedImages = [];

        // for (let i = 0; i < req.files.length; i++) {
        //     images[i] = req.files[i].filename;

        //     const outputPath = path.join(__dirname, '../public/adminAsset/productImages', req.files[i].filename);

        //     await sharp(req.files[i].path)
        //         .resize({ width: 1728, height: 2160 })
        //         .toFile(outputPath);

        //     resizedImages[i] = req.files[i].filename;

        // }

        const { productName, description, price, stock} = req.body
        const catedata = await Category.findOne({ categoryName:req.body.category });
        if (catedata){
            const product = new Product({ 
                productName,
                description,
                price,
                stock,
                category: catedata.categoryName,
                images: images, 
            });
            const productData = await product.save();
            const categoryData = await Category.find({});
            if(productData){
                res.render('addProduct',{message:"product Added Succesfully..!",category:categoryData});
            } else{
                res.render('addProduct', { message: "product Adding Failed..!", category: categoryData });
            }
        } else {
            res.render('addProduct', { message: "An error occurred while fetching categories.", category: catedata });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// load edit product page

const loadEditProduct = async(req,res)=>{
    try {
        
        const producData = await Product.findById({_id:req.query.id});
        const catData = await Category.find({})
        if(producData){
            res.render('editProduct',{products:producData,category:catData})
        } else {
            req.redirect('/admin/dashboard')
        }


    } catch (error) {
        console.log(error.message);
    }
}

// update Product

const updateProduct = async(req,res)=>{
    try {
        const prodData = await Product.findById({_id:req.query.id});
        const { productName, description, price, stock,category } = req.body;
        const productData = await Product.findByIdAndUpdate({_id:req.query.id},{$set:{productName,description,price,stock,category}});
        for(let i=0;i<req.files.length;i++){
          await Product.findByIdAndUpdate({_id:req.query.id},{$push:{images:req.files[i].filename}});
        }
        // for (let i = 0; i < req.files.length; i++) {
        //     const image = req.files[i];
        //     const outputPath = path.join(__dirname, '../public/adminAsset/productImages/resized', image.filename);

        //     await sharp(image.path)
        //         .resize({ width: 1000, height: 1000, fit: 'cover' })
        //         .toFile(outputPath);

        //     await Product.findByIdAndUpdate(
        //         { _id: req.query.id },
        //         { $push: { images: image.filename } }
        //     );
        // }

        if (productData ){
            res.redirect('/admin/productList');
        } else {
            res.render('editProduct');
        }

    } catch (error) {
        console.log(error.message);
    }
}

// delete images of product

const deleteImage = async(req,res)=>{
    try {
        const productId = req.query.id
        const fileName = req.query.fileName
        if(productId && fileName){
            // delete from database
            const updatedProd = await Product.findByIdAndUpdate(
                productId,
                { $pull: { images: fileName } },
                { new: true } 
            );
            if(!updatedProd){
                throw new Error('Product not found');
            }
    
            // Delete the image file from storage 

            await fs.unlink(path.join(__dirname, "../public/adminAsset/productImages", req.query.fileName), (error) => {
                if (error) {
                    console.log(error.message);
                }
            });
            res.redirect(`/admin/editProduct/?id=${productId}`);
        } else {
            throw new Error('Invalid request parameters');
        }
        

    } catch (error) {
        console.log(error.message);
    }
}

// unlist product 
 const doUnlistProducrt = async(req,res)=>{
    try {

        await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false }});
        res.redirect('/admin/productlist');
        
    } catch (error) {
        console.log(error.message);
    }
 }

//  list product

const doListProducrt = async (req, res) => {
    try {

        await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } });
        res.redirect('/admin/productlist');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProductList,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    updateProduct,
    deleteImage,
    doUnlistProducrt,
    doListProducrt,

      
}