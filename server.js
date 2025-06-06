
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
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  const jsessionid = response.data.responseBody?.jsessionid?.["$"];
  if (!jsessionid) throw new Error("Login falhou");
  return `JSESSIONID=${jsessionid}`;
}

// ROTA PARA INSERIR PESQUISA
app.post('/api/inserir-pesquisa', async (req, res) => {
  try {
    const sessionId = await loginSankhya();

    const {
      posvenda, servico, prazoserv, time,
      limpo, recomenda, comentarios, nunota
    } = req.body;

    const data = {
      serviceName: "DatasetSP.save",
      requestBody: {
        entityName: "AD_PESQUISASATIS",
        standAlone: false,
        fields: [
          "POSVENDA", "SERVICO", "PRAZOSERV", "TIME",
          "LIMPO", "RECOMENDA", "COMENTARIO", "NUNOTA"
        ],
        records: [
          {
            values: {
              "0": posvenda,
              "1": servico,
              "2": prazoserv,
              "3": time,
              "4": limpo,
              "5": recomenda,
              "6": comentarios,
              "7": nunota
            }
          }
        ]
      }
    };

    const response = await axios.post(
      `${SANKHYA_URL}/mge/service.sbr?serviceName=DatasetSP.save&outputType=json`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionId
        }
      }
    );

    res.status(200).json({ sucesso: true, dados: response.data });

  } catch (error) {
    console.error('Erro ao inserir pesquisa:', error.message);
    res.status(500).json({ erro: 'Erro ao inserir pesquisa', detalhes: error.message });
  }
});

// Servir arquivos estáticos (como index.html e style.css)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor na porta da Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
