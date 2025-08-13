const express = require('express')
const router = express.Router()
const db = require('../db.js')

function verifyExisting({ username, email, cpf }) {
    const existing = db.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2 OR cpf = $3',
        [username, email, cpf]
    )
    if (existing) {
        return true
    }
    return false
}

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

router.post('/', async (req, res) => {
    const { username, password, email, cpf } = req.body
    const date = new Date()
    try {
        verifyExisting({ username, email, cpf })
            ? res.status(400).json({ message: 'Usuário já existe' })
            : null

        const result = await db.query(
            'INSERT INTO users (username, password, cpf, birthday, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, cpf, date, email]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        )
        res.status(201).json(result.rows[0])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

module.exports = router