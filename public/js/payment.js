// Pastikan Snap sudah ter-load dari script Midtrans
document.getElementById('payButton').addEventListener('click', function(event) {
    event.preventDefault(); // Mencegah form dari submit

    // Contoh data keranjang
    const cart = [{ id: '2', name: 'Tshirt', price: 2400000000, quantity: 1 }];
    
    // Hitung total gross amount
    const grossAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Kirim request untuk membuat transaksi
    fetch('/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gross_amount: grossAmount }) // Kirim total sebagai gross_amount
    })
    .then(response => response.json())
    .then(data => {
        const tokenId = data.tokenId;
        if (tokenId) {
            console.log('Token ID diterima:', tokenId);
            snap.pay(tokenId, {
                onSuccess: function(result) {
                    console.log('Pembayaran berhasil:', result);
                    alert('Pembayaran berhasil!');
                },
                onPending: function(result) {
                    console.log('Pembayaran pending:', result);
                    alert('Pembayaran masih dalam proses!');
                },
                onError: function(error) {
                    console.error('Pembayaran gagal:', error);
                    alert('Terjadi kesalahan pada pembayaran.');
                },

                onClose: function() {
                    console.log('Popup pembayaran ditutup oleh pengguna.');
                }
            });
        } else {
            console.error('Token ID tidak diterima:', data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
