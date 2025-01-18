const db = require('../database/db');

const Product = {
    getAll: () => db.promise().query('SELECT * FROM product'),
    create: async (name, image, category, price) => {
        const sql = 'INSERT INTO product (name, image, category, price) VALUES (?, ?, ?, ?)';
        return db.execute(sql, [name, image, category, price]);
    },
    update: async (id, product) => {
        const sql = 'UPDATE product SET name = ?, image = ?, category = ?, price = ? WHERE id = ?';
        return db.promise().query(sql, [name,image, category, price, id]);
    },
    delete: async (id) => {
        const sql = 'DELETE FROM product WHERE id = ?';
        return db.execute(sql,[id]);
    }
    
};

module.exports = Product;
