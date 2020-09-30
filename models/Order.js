const mongoose = require('mongoose')

const orderedProducts = mongoose.Schema({
    concreteProductId: String,
    quantity: String
}, {_id: false});

const OrderSchema = mongoose.Schema({
    transactionId: {
        type: String,
        required: true
    },
    products : [orderedProducts],
    phone: {
        type: String,
        required: true
    },
    shippingAdress: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    status: {   // Pending, Confirmed, Cancelled
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Order', OrderSchema);