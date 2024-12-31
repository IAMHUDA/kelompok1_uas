const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/middleware.js');
const db = require('../database/db');

// Rute untuk mendapatkan produk
router.get('/', isAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Ambil data produk dari database
    db.query('SELECT * FROM products', (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving products from database.');
        }

        res.render('product', {
            layout: 'layouts/main-layout',
            page: 'product',
            totalItems,
            totalPrice,
            products: results // Kirim hasil query ke view
        });
    });
});

// Ekspor router
module.exports = router;
