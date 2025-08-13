require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({optionsSuccessStatus: 200}));
app.use(express.json());

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