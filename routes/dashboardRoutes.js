const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { isAuthenticated } = require('../middlewares/middleware');
const multer = require('multer');

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pastikan folder ini ada
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nama file yang unik
    }
});

const upload = multer({ storage: storage });

// Rute untuk menampilkan halaman dashboard dengan daftar produk
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const [products] = await Product.getAll();
        res.render('dashboard', {
            layout: 'layouts/main-layout',
            page: 'dashboard',
            products,
            user: req.session.user // Mengirimkan data pengguna
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil produk');
    }
});

// Rute untuk menampilkan halaman login
router.get('/login', (req, res) => {
    res.render('login'); // Menampilkan halaman login
});

// Membuat produk baru
router.post('/create', upload.single('image'), async (req, res) => {
    const { name, category, price } = req.body;
    const image = req.file; // File yang diunggah

    // Log untuk debug
    console.log('Uploaded file:', image);
    console.log('Request body:', req.body);

    // Validasi input
    if (!name || !category || !price || !image) {
        return res.status(400).send('Semua field wajib diisi!');
    }

    // Proses simpan ke database
    const imagePath = image.filename; // Menyimpan nama file
    const productData = {
        name: name || null,
        category: category || null,
        price: price ? parseFloat(price) : null, // Pastikan harga dalam format numerik
        image: imagePath
    };

    console.log('Creating product with:', productData);
    
    try {
        await Product.create(productData.name, productData.image, productData.category, productData.price);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error while creating product:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan produk');
    }
});

// Mengupdate produk
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const productId = req.params.id;
    const { name, category, price } = req.body;
    const image = req.file; // File yang diunggah

    // Log untuk debug
    console.log('Uploaded file:', image);
    console.log('Request body:', req.body);

    // Validasi input
    if (!name || !category || !price) {
        return res.status(400).send('Semua field wajib diisi!');
    }

    // Menggunakan gambar yang ada jika tidak ada gambar baru
    const productData = {
        name: name || null,
        category: category || null,
        price: price ? parseFloat(price) : null,
        image: image ? image.filename : undefined // Hanya menyimpan nama file jika ada
    };

    console.log('Updating product with:', productData);
    
    try {
        await Product.update(productId, productData);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error while updating product:', error);
        res.status(500).send('Terjadi kesalahan saat mengupdate produk');
    }
});

// Menghapus produk
router.post('/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.delete(productId);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error while deleting product:', error);
        res.status(500).send('Terjadi kesalahan saat menghapus produk');
    }
});

module.exports = router;
