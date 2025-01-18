const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const midtransClient = require('midtrans-client');
const { isAuthenticated } = require('../middlewares/middleware'); // Mengimpor middleware
const router = express.Router();

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    isProduction: false,
});

// Middleware untuk memeriksa peran pengguna
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
    }
}

// Fungsi untuk autentikasi pengguna
async function authenticateUser(username, password) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.query(query, [username]);

    console.log('Query Result:', rows); // Debug hasil query

    if (rows.length === 0) {
        throw new Error('User not found');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    return user;
}


// Route Signup
router.post('/signup', (req, res) => {
    const { username, password, role = 'user' } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Error hashing password');
        }res.redirect('/login');

        db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hash, role],
            (err, result) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).send('Error registering user');
                }

                console.log('User registered successfully:', result);
                 // Redirect ke halaman login setelah berhasil signup
            }
        );
    });
});



// Route untuk menampilkan form signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'layouts/main-layout',
        page: 'signup'
    });
});

// Fungsi untuk mengambil produk dari database
async function getProducts() {
    const query = 'SELECT * FROM product'; // Sesuaikan dengan nama tabel produk Anda
    const [rows] = await db.query(query);
    return rows;
}

// Route untuk login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await authenticateUser(username, password);
        req.session.user = user;

        // Arahkan pengguna berdasarkan perannya
        if (user.role === 'admin') {
            res.redirect('/dashboard'); // Arahkan admin ke halaman dashboard
        } else {
            res.redirect('/product'); // Arahkan pengguna biasa ke halaman produk
        }
    } catch (error) {
        console.error(error);
        res.status(401).send('Username atau password salah.'); // Memberikan pesan kesalahan
    }
});

// Route untuk menampilkan form login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout',
        page: 'login'
    });
});

// Rute untuk logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); // Redirect ke halaman utama setelah logout
    });
});

// Route untuk menampilkan halaman utama
router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    res.render('index', {
        layout: 'layouts/main-layout',
        page: 'home',
        totalItems,
        user: req.session.user,
    });
});

// Rute dashboard yang memerlukan otentikasi admin
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await getProducts(); // Ambil produk dari database
        res.render('dashboard', {
            layout: 'layouts/main-layout',
            user: req.session.user, // Mengambil informasi pengguna dari session
            products, // Kirim produk ke template
            page: 'dashboard'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products.');
    }
});

// Route untuk menampilkan profil pengguna
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        layout: 'layouts/main-layout',
        user: req.session.user
    });
});

// Rute untuk menampilkan halaman produk
router.get('/product', isAuthenticated, async (req, res) => {
    try {
        const products = await getProducts(); // Ambil produk dari database
        res.render('product', {
            layout: 'layouts/main-layout',
            products,
            user: req.session.user,
            page: 'products'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products.');
    }
});

module.exports = router;
