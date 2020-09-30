const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    storeName: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('ConcreteProduct', ProductSchema);