import { useState } from 'react';
import { initWeb3 } from './web3/service';
import { getEncryptionKey, encryptBackup } from './web3/encryptBackup';
import { uploadToIPFS, getFromIPFS } from './web3/upload';

function App() {
  const [account, setAccount] = useState('');
  const [backupData, setBackupData] = useState('');

  const handleConnect = async () => {
    const { address } = await initWeb3();
    setAccount(address);
  };

  const handleSave = async () => {
    const { provider, vault, address } = await initWeb3();
    
    const encryptionKey = await getEncryptionKey(provider, address);
    const encrypted = await encryptBackup(backupData, encryptionKey);
    const cid = await uploadToIPFS(encrypted);
    
    await vault.createBackup('seed-phrase', cid, 'My seed phrase', false);
    alert('Saved!');
  };

  return (
    <div>
      {account ? (
        <div>
          <h2>Connected: {account}</h2>
          <textarea value={backupData} onChange={(e) => setBackupData(e.target.value)} />
          <button onClick={handleSave}>Save Backup</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
    </div>
  );
}

export default App;