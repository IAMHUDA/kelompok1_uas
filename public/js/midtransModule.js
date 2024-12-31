const axios = require('axios');

async function midtransTransaction(paymentData) {
    try {
        const response = await axios.post('https://api.midtrans.com/v2/charge', paymentData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')
            }
        });

        if (response.data.redirect_url) {
            return response.data.redirect_url;
        } else {
            throw new Error('Invalid response from Midtrans');
        }
    } catch (error) {
        console.error('Midtrans Transaction Error:', error.message);
        throw error; // Re-throw for route handling
    }
}

module.exports = midtransTransaction;
