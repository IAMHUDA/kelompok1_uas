const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const { isAuthenticated } = require('../middlewares/middleware');

// Create Midtrans Snap instance
const snap = new midtransClient.Snap({
    clientKey: process.env.MIDTRANS_CLIENT_KEY, // Use your client key from environment variables
    isProduction: false, // Set to true for production
});

// Rute untuk proses pembayaran
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { cart } = req.session;
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'Keranjang belanja kosong.' });
        }

        // Hitung total harga
        const grossAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Siapkan data transaksi
        const transactionDetails = {
            transaction_details: {
                order_id: 'order-' + new Date().getTime(), // ID unik untuk setiap transaksi
                gross_amount: grossAmount, // Total amount
            },
            item_details: cart.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
            })),
            credit_card: {
                secure: true, // Enable secure for tokenization
            },
        };

        // Buat transaksi
        const transaction = await snap.createTransaction(transactionDetails);
        const tokenId = transaction.token; // Ambil token_id dari respons

        // Redirect user ke Midtrans payment page
        res.redirect(transaction.redirect_url);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Gagal memproses pembayaran.', error: error.message });
    }
});

module.exports = router;
