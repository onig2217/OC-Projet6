const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require ('express-rate-limit');


const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');

const Sauce = require('./models/sauce');
const User = require('./models/user');
require('dotenv').config()

// Connection à MongoDB 
mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@'+process.env.DB_HOST+'/'+process.env.DB_NAME+'?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

// Configuration du headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use(xss());
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' })); // Body limit is 10
const limit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 100,// max requests
  message: 'Too many requests' // message to send
});
app.use(limit); //apply to  all requests

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;