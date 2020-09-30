const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv/config');

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Import Routes
const authRoute = require('./routes/auth');
const tokenRoute = require('./routes/tokens').tokenRouter;
const uploadRoute = require('./routes/fileUpload');
const storesRoute = require('./routes/stores');
const storeRoute = require('./routes/store');
const productRoute = require('./routes/product');
const concreteProductRoute = require('./routes/concreteProduct');
const orderRoute = require('./routes/order');

// Route Middlewares
app.use('/stores', storesRoute);
app.use('/store', storeRoute);
app.use('/products', productRoute);
app.use('/concrete-products', concreteProductRoute);
app.use('/api/user', authRoute);
app.use('/api/token', tokenRoute);
app.use('/api/upload', uploadRoute);
app.use('/order', orderRoute);
app.use('/img', express.static(path.join(__dirname, 'img')))

// Routes
app.get('/', (req, res) => {
    res.send('We are on home');
})

// Connect to DB
mongoose.connect(process.env.DB_CONNECT,{
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority"},
() => console.log("Connected to DB"));

//Boot server
app.listen(25565, "0.0.0.0", (req, res) => { console.log("Server Started") });
