const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = import.meta.env.VITE_INFURA_PROJECT_SECRET;

export const uploadToIPFS = async (encryptedData) => {
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
  formData.append('file', blob);

  const response = await fetch(`https://${INFURA_PROJECT_ID}:${INFURA_PROJECT_SECRET}@ipfs.infura.io:5001/api/v0/add`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.Hash;
};

export const getFromIPFS = async (cid) => {
  const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
  return await response.json();
};