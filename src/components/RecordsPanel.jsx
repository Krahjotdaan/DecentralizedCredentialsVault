// src/components/RecordsPanel.jsx
import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getEncryptionKey, decryptBackup } from '../crypto/encrypt.js';
import { getFromIPFS } from '../web3/upload.js';

export default function RecordsPanel({ backups }) {
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState({});

  const handleDecrypt = async (backup) => {
    if (decryptedValues[backup.key]) return;
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const keyBytes = await getEncryptionKey(provider, address);
      const data = await getFromIPFS(backup.cid);
      const plaintext = await decryptBackup(data.ciphertext, data.iv, keyBytes);
      
      setDecryptedValues(prev => ({ ...prev, [backup.key]: plaintext }));
    } catch (err) {
      alert('Decryption failed: ' + err.message);
    }
  };

  const handleDeprecate = async (key, vault) => {
    try {
      await vault.deprecateBackup(key);
      // Обновление списка происходит через App.jsx → loadBackups
      alert('Record deprecated');
    } catch (err) {
      alert('Failed to deprecate: ' + err.message);
    }
  };

  const filteredBackups = showDeprecated 
    ? backups 
    : backups.filter(b => !b.deprecated);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={showDeprecated}
            onChange={() => setShowDeprecated(prev => !prev)}
          />
          Показывать устаревшие
        </label>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        {filteredBackups.length === 0 ? (
          <p style={{ padding: '10px' }}>Нет записей</p>
        ) : (
          filteredBackups.map((b) => (
            <div 
              key={b.key} 
              style={{ 
                padding: '8px', 
                borderBottom: '1px solid #eee',
                backgroundColor: b.deprecated ? '#fff0f0' : '#fff',
                cursor: 'pointer'
              }}
              onClick={() => handleDecrypt(b)}
            >
              <span>{b.key}</span>
              {b.deprecated && <span style={{ color: 'red', marginLeft: '5px' }}>(устарело)</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}