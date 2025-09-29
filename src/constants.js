const server = 'https://www.completai.com.br/completai-v4-ws/rest/services';
//const server = 'http://192.168.18.7:8080/completai-v4-ws/rest/services'   //Para teste no emulador Android

const serverUpload = 'https://www.fuellog.com.br/fuellog-validacao-ws';
//const serverUpload = 'http://192.168.18.7:8080/fuellog-validacao-ws'

const SECURITY_TOKEN =
  '039DkfwOp1-34jk22QmnpP-PPqW0135Ls-lLpq091LWq-WqpOSwer5W';

const secret_key_encrypt_data = 'g@!H7#q0';
const initVector = 'RandomInitVector';

const termosUso = 'https://www.completai.com.br/completai-web/termos';
const termosUso_semlogo =
  'https://www.completai.com.br/completai-web/termos_sl';

export {
  initVector,
  secret_key_encrypt_data,
  SECURITY_TOKEN,
  server,
  serverUpload,
  termosUso,
  termosUso_semlogo,
};
