const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÕES
const SANKHYA_URL = 'http://sankhya2.nxboats.com.br:8180';
const USUARIO = 'SUP';
const SENHA = 'Sup#ti@88#3448';

// LOGIN NO SANKHYA
async function loginSankhya() {
  const response = await axios.post(`${SANKHYA_URL}/mge/service.sbr?serviceName=MobileLoginSP.login&outputType=json`, {
    serviceName: "MobileLoginSP.login",
    requestBody: {
      NOMUSU: { "$": USUARIO },
      INTERNO: { "$": SENHA },
      KEEPCONNECTED: { "$": "S" }
    }
  });
  return response.data;
}

// ROTA DE TESTE
app.get('/teste', async (req, res) => {
  try {
    const login = await loginSankhya();
    res.json(login);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao se conectar com o Sankhya', detalhe: error.message });
  }
});

// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
