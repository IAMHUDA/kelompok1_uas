const db = require('../database/db');

const Product = {
    getAll: () => db.promise().query('SELECT * FROM product'),
    create: async (name, image, category, price) => {
        const sql = 'INSERT INTO product (name, image, category, price) VALUES (?, ?, ?, ?)';
        return db.execute(sql, [name, image, category, price]);
    },
    update: (id, product) => db.promise().query('UPDATE product SET name = ?, image = ?, category = ?, price = ? WHERE id = ?', [product.name, product.image, product.category, product.price, id]),
    delete: (id) => db.promise().query('DELETE FROM product WHERE id = ?', [id])
};

module.exports = Product;
