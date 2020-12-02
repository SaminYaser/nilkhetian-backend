const router = require('express').Router();

const HomeCategory = require('../models/HomeCategory');

router.get('/', async (req, res) => {
    try{
        const result = await HomeCategory.find();
        var output = [];
        result.forEach(o => {
            output.push({
                category: o.category,
                products: o.products
            })
        })
        res.send(output);
    } catch (err) {
        console.log(err);
        res.status(404).send("Category Not Found");
    }
})

router.post('/', async (req, res) => {
    // Check if category allready exists
    const check = HomeCategory.count({category: req.body.category});
    if(check === 0) {
        return res.status(409).send("Category all ready exists");
    }

    // Check if product category conflicts
    const conflict = req.body.products.filter(p => p.category !== req.body.category);
    if(conflict.length !== 0)   return res.status(400).send("Product contains a different category from list category")

    // Save to DB
    const homeCategory = new HomeCategory({
        category: req.body.category,
        products: req.body.products
    })
    const savedResult = homeCategory.save();
    if(savedResult) res.send("Category Saved Successfully");
    else    res.send("Saving Failed");
})

router.patch('/', async (req, res) => {
    const conflict = req.body.products.filter(p => p.category !== req.body.category);
    if(conflict.length === 0)   return res.status(400).send("Product contains a different category from list category")
    
    HomeCategory.findOneAndUpdate({category: req.body.category, $set: products})
})


module.exports = router;