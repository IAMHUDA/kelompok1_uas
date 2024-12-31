

document.querySelectorAll('.remove-from-cart-button').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        fetch(`/cart/remove/${productId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            // Update jumlah item di badge
            document.querySelector('.cart-badge').textContent = data.totalItems;

            // Perbarui tampilan keranjang (misalnya, dengan merender ulang atau menghapus item dari DOM)
            // Anda bisa menggunakan AJAX untuk memperbarui tampilan tanpa memuat ulang halaman
            // Contoh:
            this.closest('tr').remove(); // Menghapus baris tabel item dari tampilan
        });
    });
});


