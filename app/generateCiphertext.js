const https = require('https');
const { randomUUID } = require('crypto');

const ENTITY_SECRET = '28d20cc946e2645321f01088fa8dff8862b1a7fda933b3f6d130d30c82ee2c1d';
const API_KEY = 'TEST_API_KEY:534731bccf5657cf1cbfdef87773301e:fc4703358050650391a4395dbcd07c7f';

// Step 1: Get public key
https.get({
  hostname: 'api.circle.com',
  path: '/v1/w3s/config/entity/publicKey',
  headers: { 'Authorization': 'Bearer ' + API_KEY }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const publicKey = JSON.parse(d).data.publicKey;
    console.log('Got public key ✅');

    // Step 2: Encrypt using forge (pure JS, no OpenSSL needed)
    // We'll use a different approach - manual RSA with built-in crypto
    const { createPublicKey, publicEncrypt, constants } = require('crypto');
    
    let ciphertext;
    try {
      const pubKeyObj = createPublicKey(publicKey);
      const encrypted = publicEncrypt(
        { key: pubKeyObj, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(ENTITY_SECRET, 'hex')
      );
      ciphertext = encrypted.toString('base64');
      console.log('Ciphertext generated ✅');
      console.log('Length:', ciphertext.length);
    } catch(e) {
      console.log('Encryption failed:', e.message);
      console.log('\nYour public key is:\n' + publicKey);
      console.log('\nPlease use an online RSA-OAEP SHA256 encryption tool with the above key');
      return;
    }

    // Step 3: Create wallet set
    const body = JSON.stringify({
      idempotencyKey: randomUUID(),
      entitySecretCiphertext: ciphertext,
      name: 'ArcPay Users'
    });

    const req = https.request({
      hostname: 'api.circle.com',
      path: '/v1/w3s/developer/walletSets',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res2 => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => {
        console.log('\n✅ Wallet Set Created:');
        console.log(d2);
        try {
          const parsed = JSON.parse(d2);
          const id = parsed?.data?.walletSet?.id;
          if (id) {
            console.log('\n🎉 YOUR WALLET SET ID IS:');
            console.log(id);
            console.log('\nAdd this to .env.local:');
            console.log('CIRCLE_WALLET_SET_ID=' + id);
          }
        } catch(e) {}
      });
    });
    req.write(body);
    req.end();
  });
});