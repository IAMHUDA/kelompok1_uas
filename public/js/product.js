document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (event) => {
        const formData = new FormData(form);
        const product = {
            id: formData.get('id'),
            name: formData.get('name'),
            price: formData.get('price'),
            quantity: 1
        };

        // Simpan produk ke local storage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const filterSelect = document.getElementById('filter');
    const productItems = document.querySelectorAll('.grid > div'); // Ambil semua item produk

    filterSelect.addEventListener('change', function() {
        const selectedCategory = this.value;

        productItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category').toLowerCase(); // Pastikan dibandingkan dengan huruf kecil

            // Tampilkan atau sembunyikan item berdasarkan kategori
            if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                item.style.display = ''; // Tampilkan item
            } else {
                item.style.display = 'none'; // Sembunyikan item
            }
        });
    });
});
