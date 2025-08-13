const express = require('express');
const router = express.Router();
const db = require('../db.js');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sales');
        res.json(result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Nenhum pedido encontrado' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const date = new Date();
    const { description, price } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sales (date, description, price) VALUES ($1, $2, $3) RETURNING *',
            [date, description, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, completed } = req.body;

    try {
        const result = await db.query(
            `UPDATE sales
            SET description = $1, completed = $2
            WHERE id = $3
            RETURNING *`,
            [description, completed, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM sales WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        res.json({ message: 'Pedido excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;