import * as crypto from 'crypto';

export function generateSignature(privateKeyPem: string, accessId: string, accessTime: number, bodyString: string): string {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const message = `${accessId}:${accessTime}:${bodyString}`;
  
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();
  
  const signature = sign.sign(privateKey);
  return signature.toString('base64');
}
