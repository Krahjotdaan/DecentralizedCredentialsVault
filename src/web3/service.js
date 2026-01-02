import { BrowserProvider, Contract } from 'ethers';
import VaultABI from '../contracts/Vault.json';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT;
const SEPOLIA_CHAIN_ID = 11155111; 

export const initWeb3 = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  if (network.chainId !== SEPOLIA_CHAIN_ID) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }]
    });
  }

  const vault = new Contract(VAULT_ADDRESS, VaultABI, signer);
  const address = await signer.getAddress();
  return { provider, signer, vault, address };
};