require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(cors({optionsSuccessStatus: 200}));
app.use(express.json());

// Criar schema via endpoint
app.post('/api/:nome', async (req, res) => {
  const { nome } = req.params;
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${nome}`);
    res.json({ mensagem: `Schema "${nome}" criado com sucesso!` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const salesRoutes = require('./routes/pedidos.js');
app.use('/api/pedidos', salesRoutes);

const userRoutes = require('./routes/auth.js');
app.use('/api/auth', userRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});