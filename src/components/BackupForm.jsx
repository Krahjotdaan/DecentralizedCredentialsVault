// src/components/BackupForm.jsx
import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getEncryptionKey, encryptBackup } from '../crypto/encrypt.js';
import { uploadToIPFS } from '../web3/upload.js';

export default function BackupForm({ vault, onCreated }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key || !value) {
      alert('Ключ и значение обязательны');
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const encryptionKey = await getEncryptionKey(provider, address);
      const encrypted = await encryptBackup(value, encryptionKey);
      const cid = await uploadToIPFS(encrypted);

      const tx = await vault.createBackup(key, cid, description, false);
      await tx.wait(); // Ждём подтверждения

      const [createdAt, updatedAt, allowedOverwrite, deprecated, cidFromContract, descFromContract] = 
        await vault.getBackup(key);

      onCreated({
        key,
        createdAt: Number(createdAt),
        updatedAt: Number(updatedAt),
        allowedOverwrite,
        deprecated,
        cid: cidFromContract,
        description: descFromContract
      });

      alert(`Запись "${key}" успешно создана и сохранена в блокчейне!`);
      
      setKey('');
      setValue('');
      setDescription('');
    } catch (err) {
      if (err.code === 'ACTION_REJECTED') {
        console.log('Транзакция отменена пользователем');
        return;
      }
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div>
        <label>Ключ: </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="my-key"
          style={{ width: '100%', padding: '4px' }}
          required
        />
      </div>
      <div>
        <label>Значение: </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="secret value"
          style={{ width: '100%', padding: '4px' }}
          required
        />
      </div>
      <div>
        <label>Описание: </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="описание"
          style={{ width: '100%', padding: '4px' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Создаю...' : 'Создать'}
      </button>
    </form>
  );
}