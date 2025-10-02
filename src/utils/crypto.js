import CryptoJS from 'crypto-js';
import { secret_key_encrypt_data } from '../constants';

export function decrypt(base64Text) {
  if (!base64Text) return '';

  try {
    // 🔑 chave DES = 8 bytes
    const key = CryptoJS.enc.Utf8.parse(
      secret_key_encrypt_data.substring(0, 8),
    );

    // IV zerado de 8 bytes (igual Buffer.alloc(8,0))
    const iv = CryptoJS.enc.Utf8.parse('\0\0\0\0\0\0\0\0');

    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(base64Text) },
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.log('❌ Erro no decrypt:', err.message, '| Input:', base64Text);
    return '';
  }
}
