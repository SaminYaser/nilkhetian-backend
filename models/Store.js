const mongoose = require('mongoose');

const StoreSchema = mongoose.Schema({
    storeName: {
        type: String,
        required: true
    },
    storeDetails: {
        type: String,
        required: true
    },
    categories: []
})

module.exports = mongoose.model('Store', StoreSchema);