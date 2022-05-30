const express = require('express');
const { Product } = require('../model/product');
const { Category } = require('../model/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

//validate file type
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

//function for fetching image(start)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
//function for fetching image(end)

//getting products with category/getting products filter by categories with categories
router.get(`/`,async (req,res)=>{
        // localhost:3000/api/v1/products?categories=2342342,234234
        let filter = {};
        if(req.query.categories)
        {
             filter = {category: req.query.categories.split(',')}
        }
    
    const productList= await Product.find(filter).populate('category');

    if(!productList){
        res.status(500).json({success:false})
    }
    res.send(productList);
})

const uploadOptions = multer({ storage: storage });

//getting products with category by id
router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})

//post new product by finding category
router.post(`/`,uploadOptions.single('image'),async(req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    //start image capture
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    //end image capture

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

     product = await product.save();
    if(!product)
    return res.status(500).send('The product not created')

    res.send(product);


})

//finding product id then update it
router.put('/:id', uploadOptions.single('image'), async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
       return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');
    //start image capture
    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }
    //end image capture
    //multiple image capture start
    // const files = req.files;
    // let imagesPaths = [];
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    // if (files) {
    //     files.map((file) => {
    //         imagesPaths.push(`${basePath}${file.filename}`);
    //     });
    // }
    //multiple image capture end

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            //images: imagesPaths,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true}
    )

    if(!updatedProduct)
    return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct);
})

//delete product by their id
router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

//count products
router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments({})

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

//getting featured product as many as we want
router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})

//update gallery image
router.put('/gallery/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;