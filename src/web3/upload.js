const PINATA_API_KEY = import.meta.env.VITE_PINATA_PROJECT_ID;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_PROJECT_JWT;

export const uploadToIPFS = async (encryptedData) => {
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
  formData.append('file', blob);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText}\n${text}`);
    }

    const result = await response.json();
    if (!result.IpfsHash) {
      throw new Error(`No CID in response: ${JSON.stringify(result)}`);
    }

    return result.IpfsHash;
  } catch (err) {
    console.error('Pinata Upload Error:', err);
    throw new Error(`Failed to upload to IPFS: ${err.message}`);
  }
};

export const getFromIPFS = async (cid) => {
  const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
  if (!response.ok) {
    throw new Error(`IPFS fetch failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};