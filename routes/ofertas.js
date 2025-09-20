const express = require('express');
const router = express.Router();
const db = require('../db.js');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contracts');
        res.json(result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Nenhuma proposta encontrada' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const date = new Date();
    const { description, budget } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO sales (date, description, budget) VALUES ($1, $2, $3) RETURNING *',
            [date, description, budget]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, isActive } = req.body;

    try {
        const result = await db.query(
            `UPDATE contracts
            SET description = $1, isActive = $2
            WHERE id = $3
            RETURNING *`,
            [description, isActive, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Proposta não encontrada' });
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
            'DELETE FROM contracts WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Proposta não encontrado' });
        }

        res.json({ message: 'Proposta excluída com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;