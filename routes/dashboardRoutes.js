const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { isAuthenticated } = require('../middlewares/middleware');
const multer = require('multer');
const path = require('path');
const db = require('../database/db')

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pastikan folder ini ada
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nama file yang unik
    }
});

// Fungsi untuk mendapatkan produk berdasarkan ID
const getProductById = async (id) => {
    const [rows] = await db.query('SELECT * FROM product WHERE id = ?', [id]);
    return rows[0];
};


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            return cb(new Error('Hanya file gambar yang diizinkan!'), false);
        }
        cb(null, true);
    }
});

// Rute untuk menampilkan halaman dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const [products] = await Product.getAll();
        res.render('dashboard', {
            layout: 'layouts/main-layout',
            page: 'dashboard',
            products,
            user: req.session.user // Data pengguna
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil produk');
    }
});

// Membuat produk baru
router.post('/create', upload.single('image'), async (req, res) => {
    const { name, category, price } = req.body;
    const image = req.file;

    if (!name || !category || !price || !image) {
        return res.status(400).send('Semua field wajib diisi!');
    }

    const productData = {
        name,
        category,
        price: parseFloat(price),
        image: image.filename
    };

    try {
        await Product.create(productData);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error while creating product:', error);
        res.status(500).send('Terjadi kesalahan saat menyimpan produk');
    }
});



router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const productId = req.params.id;
    const { name, category, price } = req.body;
    const image = req.file; // File baru (jika ada)

    try {
        // Ambil produk berdasarkan ID
        const product = await getProductById(productId);

        if (!product) {
            console.error('Produk tidak ditemukan');
            return res.status(404).json({ message: 'Produk tidak ditemukan!' });
        }

        // Data untuk update
        const productData = {
            name: name || product.name,
            category: category || product.category,
            price: price !== undefined ? parseFloat(price) : product.price,
            image: image ? image.filename : product.image,
        };

        // Hapus gambar lama jika gambar baru diunggah
        if (image && product.image) {
            const fs = require('fs');
            const oldImagePath = `uploads/${product.image}`;
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath); // Hapus file lama
            }
        }

        // Lakukan update
        await db.query('UPDATE product SET name = ?, category = ?, price = ?, image = ? WHERE id = ?', 
            [productData.name, productData.category, productData.price, productData.image, productId]);

        res.status(200).json({ message: 'Produk berhasil diperbarui!' });
    } catch (error) {
        console.error('Error while updating product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate produk' });
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
