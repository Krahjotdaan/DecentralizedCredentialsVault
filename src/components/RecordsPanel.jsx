// src/components/RecordsPanel.jsx
import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getEncryptionKey, decryptBackup } from '../crypto/encrypt.js';
import { getFromIPFS } from '../web3/upload.js';
import BackupDetail from './BackupDetail.jsx';

export default function RecordsPanel({ backups, vault, account, role, encryptionKey }) {
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  const filteredBackups = showDeprecated 
    ? backups 
    : backups.filter(b => !b.deprecated);

  const handleBackupClick = (backup) => {
    setSelectedBackup(backup);
  };

  const handleCloseDetail = () => {
    setSelectedBackup(null);
  };

  const handleUpdated = (updatedBackup) => {
    window.location.reload();
  };

  const handleDeprecated = (key) => {
    window.location.reload();
  };

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
              onClick={() => handleBackupClick(b)}
            >
              <span>{b.key}</span>
              {b.deprecated && <span style={{ color: 'red', marginLeft: '5px' }}>(устарело)</span>}
            </div>
          ))
        )}
      </div>

      {selectedBackup && (
        <BackupDetail
          backup={selectedBackup}
          vault={vault}
          encryptionKey={encryptionKey}
          onClose={handleCloseDetail}
          onUpdated={handleUpdated}
          onDeprecated={handleDeprecated}
        />
      )}
    </div>
  );
}