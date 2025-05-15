// TypeScript global declaration for window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (...args: any[]) => Promise<any>;
  selectedAddress?: string;
  on?: (...args: any[]) => void;
  removeListener?: (...args: any[]) => void;
}

interface Window {
  ethereum?: EthereumProvider;
} 