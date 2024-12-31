const express = require('express');
const app = express();
const expressLayout = require('express-ejs-layouts');
const db = require('./database/db');
const session = require('express-session');
const productRoutes = require('./routes/productRoutes.js');
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); 
const port = process.env.PORT || 3000;

// Middleware untuk menyajikan folder uploads
app.use('/uploads', express.static('uploads'));

// Setup view engine
app.set('view engine', 'ejs'); // Set EJS sebagai view engine
app.use(expressLayout); // Gunakan express-ejs-layouts

// Set views directory jika dibutuhkan
app.set('views', __dirname + '/views'); // Ini untuk memastikan lokasi views benar

// Middleware untuk parsing request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Folder untuk file statis

require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// Konfigurasi session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware untuk menyimpan informasi pengguna di res.locals
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    const cart = req.session.cart || [];
    res.locals.totalItems = cart.reduce((acc, item) => acc + item.quantity, 0); 
    next();
});

// Rute setup
app.use('/', authRoutes); 
app.use('/dashboard', isAuthenticated, dashboardRoutes); 
app.use('/product', isAuthenticated, productRoutes); 
app.use('/payment', isAuthenticated, paymentRoutes); 

// Rute beranda publik
app.get('/', (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout', // Pastikan nama layout sesuai
        page: 'home'
    });
});

// Rute kontak publik
app.get('/contact', (req, res) => {
    res.render('contact', {
        layout: 'layouts/main-layout', 
        page: 'contact'
    });
});

// Rute keranjang
app.get('/cart', isAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', {
        layout: 'layouts/main-layout', 
        page: 'cart',
        cart
    });
});

// Rute untuk menambahkan produk ke keranjang
app.post('/cart/add', isAuthenticated, (req, res) => {
    const { id, name, price } = req.body;
    const numericPrice = parseFloat(price);

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existingProductIndex = req.session.cart.findIndex(item => item.id === id);

    if (existingProductIndex > -1) {
        req.session.cart[existingProductIndex].quantity += 1;
    } else {
        req.session.cart.push({ id, name, price: numericPrice, quantity: 1 });
    }

    res.redirect('/cart');
});

// Rute untuk menghapus produk dari keranjang
app.post('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    const cart = req.session.cart || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    req.session.cart = updatedCart; 

    const totalItems = updatedCart.reduce((acc, item) => acc + item.quantity, 0); 
    res.json({ totalItems }); 
});

// Menangani 404
app.use((req, res) => {
    res.status(404).send('404 - Halaman Tidak Ditemukan');
});

// Memulai server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
