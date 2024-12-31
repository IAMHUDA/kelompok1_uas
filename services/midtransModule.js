const midtransClient = require('midtrans-client');

const midtrans = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const midtransTransaction = async (paymentData) => {
    try {
        const response = await midtrans.charge(paymentData);
        return response.redirect_url;
    } catch (error) {
        throw error;
    }
};

module.exports = midtransTransaction;

