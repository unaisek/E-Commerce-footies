const Category = require("../models/categoryModel");
const upperCase = require('upper-case');



// load category page

const loadCategory = async (req, res) => {

    try {
        const categoryData = await Category.find({});
        res.render('category',{category:categoryData});
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// add category
const addCategory = async(req,res,next)=>{
    try {
        const categoryName = upperCase.upperCase(req.body.categoryName)
        const {description} = req.body;
        const category = new Category({
            categoryName: categoryName,
            description
        });

        const catData = await Category.findOne({categoryName:categoryName});
        if(catData){
            res.render('category',{message:"This category already exists"});
        } else {
            const categoryData = await category.save();
            if(categoryData){
                res.redirect('/admin/category');
            }else {
                res.redirect('/admin/dashboard');
            }
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const loadEditCategory = async(req,res,next)=>{
    try {

        const categoryData = await Category.findById({_id:req.query.id})
        res.render('editCategory',{category:categoryData});        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const updateCategory = async(req,res,next)=>{
    try {
        const categoryName = upperCase.upperCase(req.body.categoryName);
        const {description} = req.body;
        const findCategory = await Category.findOne({categoryName:categoryName});
        const catData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{categoryName,description}});
        if(catData){
            res.redirect('/admin/category');
        } else {
            res.render('editCategory',{message:"Category updating failed"});
        }
        

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// unlist category

const doUnlistCategory = async (req, res) => {
    try {

        const catData = await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } });
        res.redirect('/admin/category');

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

//  list product

const doListCategory = async (req, res) => {
    try {

        const catData = await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } });
        res.redirect('/admin/category');

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


// const deleteCategory = async(req,res,next)=>{
//     try {
        
//         const catData = await Category.findByIdAndUpdate({_id:req.query.id},{$set:{status:false}});
//         res.redirect('/admin/category')

//     } catch (error) {
//         console.log(error.message);
//     }
// }
module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    updateCategory,
    doUnlistCategory,
    doListCategory
    
}