export const getChallenge = (address) => `VaultBackup:${address.toLowerCase()}`;

export const getEncryptionKey = async (provider, address) => {
  const challenge = getChallenge(address);
  const signature = await provider.send('personal_sign', [challenge, address]);
  const keyHex = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature));
  return new Uint8Array(Buffer.from(keyHex.slice(2), 'hex'));
};

export const encryptBackup = async (plaintext, keyBytes) => {
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64')
  };
};

export const decryptBackup = async (ciphertextBase64, ivBase64, keyBytes) => {
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};