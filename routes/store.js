const { response } = require('express');
const express = require('express');
const ConcreteProduct = require('../models/ConcreteProduct');
const Store = require('../models/Store');
var ObjectId = require('mongoose').Types.ObjectId; 

const router = express.Router();

// Get back all posts
router.get('/', async (req, res) => {
    try{
        id = req.query.id;
        categories = req.query.categories;
        if(id !== undefined && categories !== undefined){
            response = await Store.findOne({_id: id});
            // const productList = await ConcreteProduct.find({shopId: id, categories: catagory})
            res.send(response);
        } else if (id !== undefined && categories === undefined) {
            try{
                if(id.length != 24)
                    res.status(404).send("Not Found");
                else{
                    Store.findOne({_id: id}, (err, result) => {
                        if(result) {
                            res.send(result);
                        } else {
                            res.status(404).send("Not Found");
                        }
                    });
                }
            }catch(err){
                send.status(404).send("Not Found");
            }
        } else {
            res.status(404).send('Not Found');
        }
    }catch (err){
        res.json({ message: err });
    }
})

// Create a new store
router.post('/', async (req, res) => {
    const store = new Store({
        storeName: req.body.storeName,
        storeDetails: req.body.storeDetails,
        categories: req.body.categories
    })
    try{
        const savedStore = await store.save()
        res.json(savedStore);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;