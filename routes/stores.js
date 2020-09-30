const express = require('express');
const Store = require('../models/Store');

const router = express.Router();

const paginatedResults = (model) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = 12;

        const startIndex = (page - 1) * limit;
        const results = {};

        const totalCount = await model.countDocuments();
        results.totalPages = Math.ceil(totalCount/limit);

        try {
            results.results = await model.find().limit(limit).skip(startIndex).exec();
            res.paginatedResults = results;
            next();
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

// Get back all posts
router.get('/', paginatedResults(Store), (req, res) => {
    try{
        res.json(res.paginatedResults);
    }catch (err){
        res.json({ message: err });
    }
})

module.exports = router;