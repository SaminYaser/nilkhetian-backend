const { response } = require('express');
const express = require('express');
const Order = require('../models/Order');
const Store = require('../models/Store');
const {adminAuth, auth} = require('./verifyToken');

const router = express.Router();

// Get back all orders
router.get('/', async (req, res) => {
    try{
        id = req.query.id;
        order = await Order.findById(id);
        delete order._id;
        res.send(order);
    }catch (err){
        res.json({ message: err });
    }
})

// RestApi query
router.get('/query', adminAuth, async (req, res) => {
    query = req.query.q;
    result = await Order.find(query);   // Can attack through any rest api calls
    res.send(result);
})

// Create a new order
router.post('/', auth, async (req, res) => {
    products = [];
    req.body.products.forEach(o => {
        products.push({
            concreteProductId: o._id,
            quantity: o.quantity
        });
    })
    const order = new Order({
        transactionId: Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,9),
        products: products,
        phone: req.body.phone,
        userId: req.user.id,
        shippingAdress: req.body.shippingAdress,
        status: "Pending"
    });
    console.log(order);
    try{
        const savedOrder = await order.save()
        res.json(savedOrder);   // Send email of order pdf
    } catch (err) {
        res.json({ message: err });
    }
});

router.patch ('/:transactionId', async (req, res) => {
    try{
        var setObject = {}
        if(req.body.shippingAdress){
            setObject.shippingAdress = req.body.shippingAdress;
        }
        if(req.body.phone){
            setObject.phone = req.body.phone;
        }
        if(req.body.status){
            setObject.status = status;
        }
        if(req.body.products){
            if(req.body.products.length != 0){
                setObject.products = [];
                req.body.products.forEach(product => {
                    setObject.products.push({
                        concreteProductId: product._id,
                        quantity: product.quantity
                    });
                })
            }
        }
        const order = await Order.findOneAndUpdate(
            { transactionId: req.params.transactionId },
            { $set: setObject},
        );
        res.json(order);
    }catch (err) {
        res.json({ message: err });
    }
})

module.exports = router;