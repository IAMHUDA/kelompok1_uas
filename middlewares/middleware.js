// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
    // Memeriksa apakah sesi ada dan pengguna sudah terautentikasi
    if (req.session && req.session.user) { // Ganti req.session.userId menjadi req.session.user
        return next(); // Jika terautentikasi, lanjutkan ke middleware berikutnya
    } else {
        // Jika tidak terautentikasi, redirect ke halaman login
        res.redirect('/login');
    }
}

module.exports = { isAuthenticated };
