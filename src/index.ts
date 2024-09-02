import axios from 'axios';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

// Função para gerar a assinatura
async function generateSignature(): Promise<string> {
  try {
    const privateKeyPem = await readFile('src/privateKey.pem', 'utf8');
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
    });

    const accessId = 'session/4994915788390400';
    const accessTime = Math.floor(Date.now() / 1000);
    const bodyString = ''; // Se houver um body, você deve definir aqui

    const message = `${accessId}:${accessTime}:${bodyString}`;
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();

    const signature = sign.sign(privateKey, 'base64');
    return signature;
  } catch (error) {
    console.error('Erro ao gerar a assinatura:', error);
    throw error;
  }
}

// Função para fazer a requisição GET
async function fetchData() {
  try {
    const accessTime = Math.floor(Date.now() / 1000).toString();
    const accessSignature = await generateSignature();
    const accessId = 'session/4994915788390400';

    const response = await axios.get('https://sandbox.api.starkbank.com/v2/invoice', {
      headers: {
        'Access-Id': accessId,
        'Access-Time': accessTime,
        'Access-Signature': accessSignature,
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    });

    console.log('Response data:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Mostra detalhes da resposta do erro para facilitar o debug
      console.error('Error fetching data:', error.response.data);
    } else {
      console.error('Error fetching data:', error);
    }

    // Tenta novamente após 1 minuto em caso de erro
    setTimeout(fetchData, 60000);
  }
}

// Função para iniciar o serviço
function startService() {
  fetchData(); // Chama a primeira vez
  setInterval(fetchData, 30000); // Repetir a cada 30 segundos
}

startService();
