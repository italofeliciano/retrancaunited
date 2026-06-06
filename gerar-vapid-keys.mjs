import { webcrypto } from 'node:crypto';

function base64UrlToUint8Array(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = Buffer.from(base64 + padding, 'base64');
  return new Uint8Array(binary);
}

function uint8ArrayToBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

const keyPair = await webcrypto.subtle.generateKey(
  {
    name: 'ECDSA',
    namedCurve: 'P-256',
  },
  true,
  ['sign', 'verify']
);

const publicJwk = await webcrypto.subtle.exportKey('jwk', keyPair.publicKey);
const privateJwk = await webcrypto.subtle.exportKey('jwk', keyPair.privateKey);

const x = base64UrlToUint8Array(publicJwk.x);
const y = base64UrlToUint8Array(publicJwk.y);

const publicKeyBytes = new Uint8Array(65);
publicKeyBytes[0] = 0x04;
publicKeyBytes.set(x, 1);
publicKeyBytes.set(y, 33);

const publicKey = uint8ArrayToBase64Url(publicKeyBytes);
const privateKey = privateJwk.d;

console.log('=======================================');
console.log('VAPID KEYS - RETRANCA UNITED');
console.log('=======================================');
console.log('');
console.log('Public Key:');
console.log(publicKey);
console.log('');
console.log('Private Key:');
console.log(privateKey);
console.log('');
console.log('ATENÇÃO:');
console.log('- Me mande somente a Public Key.');
console.log('- NÃO mande a Private Key no chat.');
console.log('- Guarde a Private Key em lugar seguro.');
console.log('=======================================');
