const router = require('express').Router();

const Product = require('../models/Product');

const fileUpload = require('../modules/fileUpload');

// Get category list
// Get back all product /?category=blah
router.get('/', async (req, res) => {
    try{
        const category = req.query.category;
        const search = req.query.search;
        const page = req.query.page;
        const limit = 1;
        const startIndex = (page - 1) * limit;

        if(page === undefined && (category !== undefined || search !== undefined)){
            res.status(400).json("Page number not entered");
        }

        else if(category === undefined && search === undefined){
            await Product.find().distinct('category', (error, result) => {
                if(result) {
                    res.send(result);
                } else {
                    res.status(404).send("Not Found");
                }
            });
        }
        else if(category === undefined && search !== undefined) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            output = {};
            totalCount = await Product.countDocuments({ name: regex });
            output.totalPages = Math.ceil(totalCount/limit);

            await Product.find({ name: regex }, (error, result) => {
                if(result) {
                    output.results = result;
                    res.send(output);
                } else {
                    res.status(404).send("Not Found");
                }
            }).limit(limit).skip(startIndex);
        }
        else if(category !== undefined && search === undefined) {
            output = {};
            totalCount = await Product.countDocuments({ category: { $eq: category } });
            output.totalPages = Math.ceil(totalCount/limit);
            await Product.find({ category: { $eq: category }}, (error, result) => {
                if(result) {
                    output.results = result;
                    res.send(output);
                } else {
                    res.status(404).send("Not Found");
                }
            }).limit(limit).skip(startIndex);
        }
    } catch (err){
        res.status(500).json({ message: err });
    }
})

router.post('/', fileUpload.upload.any(), async(req, res) => {
    const product = new Product({
        name: req.body.name,
        img: req.file.path,
        author: req.body.author,
        category: req.body.category
    });
    try{
        const savedProduct = await product.save()
        res.json(savedProduct);
    } catch (err) {
        res.json({ message: err });
    }
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;