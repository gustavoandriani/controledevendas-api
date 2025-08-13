const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
require('dotenv').config();

const JWT_SECRET = process.env.JWT_KEY;

router.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.status(400).json({ error: 'Erro de Validação', message: 'Nome, email e senha são obrigatórios.' });
    }

    try {
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email duplicado', message: 'Este email já está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query('INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3) RETURNING *', [fullname, email, hashedPassword]);

        res.status(201).json({ message: 'Usuário registrado com sucesso.', user: newUser.rows[0]});
    } catch (err) {
        console.error('Erro no registro:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const foundUser = user.rows[0];

        const isMatch = await bcrypt.compare(password, foundUser.password);

        if(!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: foundUser.id, email: foundUser.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login bem-sucedido!', token })
    } catch(err) {
        console.error('Erro no login:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }
        req.user = user;
        next();
    })
}

router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Rota protegida!', user: req.user });
});

module.exports = router