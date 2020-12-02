const router = require('express').Router();

const Product = require('../models/Product')
const ConcreteProduct = require('../models/ConcreteProduct');
const Store = require('../models/Store');


// Get back all posts
// Parameter: id
// Parameter: storeId, category, page
// Parameter: productId, page
router.get('/',async (req, res) => {
    try{
        const id = req.query.id;
        const storeId = req.query.storeId;
        const category = req.query.category;
        const page = req.query.page;
        const limit = 12;
        const startIndex = (page - 1) * limit;
        const productId = req.query.productId;

        if(page === undefined && ((storeId !== undefined && category !== undefined) || productId !== undefined)){
            res.status(400).json("Page number not entered");
        }
        else if (id !== undefined && storeId === undefined && category === undefined && productId === undefined){
            await ConcreteProduct.findById(id, (err, result) => {
                if(result) {
                    res.json(result);
                } else {
                    res.status(404).send("Not Found");
                }
            })
        }
        else if (id === undefined && storeId !== undefined && category !== undefined && productId === undefined){
            output = {};
            totalCount = await ConcreteProduct.countDocuments({ storeId: { $eq: storeId }, category: { $eq: category} });
            output.totalPages = Math.ceil(totalCount/limit);

            await ConcreteProduct.find({ storeId: { $eq: storeId }, category: { $eq: category} }, (error, result) => {
                if(result) {
                    output.results = result;
                    res.send(output);
                } else {
                    res.status(404).send("Not Found");
                }
            }).limit(limit).skip(startIndex);
        }
        else if (id === undefined && storeId === undefined && category === undefined && productId !== undefined) {
            output = {};
            totalCount = await ConcreteProduct.countDocuments({ productId: { $eq: productId } });
            output.totalPages = Math.ceil(totalCount/limit);
            await ConcreteProduct.find({ productId: { $eq: productId }}, (error, result) => {
                if(result) {
                    output.results = result;
                    res.json(output);
                } else {
                    res.status(404).send("Not Found");
                }
            }).limit(limit).skip(startIndex);
        }
    } catch (err){
        res.status(500).json({ message: err });
    }
})

// Input ConcreteProducts
// Image must be uploaded as a multipart form
// Parameter: productId, price, storeId
router.post('/', async(req, res) => {
    try{
        productId = req.body.productId;
        price = req.body.price;
        storeId = req.body.storeId;
        if(productId !== undefined && price !== undefined && storeId !== undefined){
            const product = await Product.findById(productId);
            const store = await Store.findById(storeId);
            const concreteProduct = ConcreteProduct({
                productId: product._id,
                name: product.name,
                img: product.img,
                author: product.author,
                price: price,
                category: product.category,
                storeId: store._id,
                storeName: store.name
            })
            await addIfNewCategory(storeId, product.category);
                
                const savedProduct = await concreteProduct.save()
                res.json(savedProduct);
        }
        else{
            res.status(404).send("Not Found");
        }
    } catch (err) {
        res.json({ message: err });
    }
})

async function addIfNewCategory(shopId, category){
    const store = await Store.findById(shopId);
    if (!store.categories.includes(category)) {
        store.categories.push(category);
        store.save();
    }
}

module.exports = router;