const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({
    name: {
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
})

module.exports = mongoose.model('Product', ProductSchema);