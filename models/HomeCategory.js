const mongoose = require('mongoose');
const ConcreteProduct = require('./ConcreteProduct');

const ProductSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    category: {
        type: String,
        required: true
    }
}, {_id: false})

const HomeCategorySchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    products: [ProductSchema]
})

module.exports = mongoose.model('HomeCategory', HomeCategorySchema);