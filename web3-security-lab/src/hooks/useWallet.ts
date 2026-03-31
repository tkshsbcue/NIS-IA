import { useCallback, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { useStore } from '@/store';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

const SEPOLIA_NETWORK_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia',
  rpcUrls: ['https://rpc.sepolia.org'],
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

function getEthereum(): any {
  return (window as any).ethereum;
}

export function useWallet() {
  const { walletState, setWallet, addConsoleMessage } = useStore();

  const getProvider = useCallback(() => {
    const ethereum = getEthereum();
    if (!ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return new BrowserProvider(ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    const provider = getProvider();
    return provider.getSigner();
  }, [getProvider]);

  const connect = useCallback(async () => {
    try {
      const ethereum = getEthereum();
      if (!ethereum) {
        addConsoleMessage({
          type: 'error',
          message: 'MetaMask is not installed. Please install it to continue.',
        });
        return;
      }

      addConsoleMessage({ type: 'info', message: 'Connecting to MetaMask...' });

      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setWallet({
        address: accounts[0],
        balance: balance.toString(),
        chainId: Number(network.chainId),
        connected: true,
      });

      addConsoleMessage({
        type: 'success',
        message: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      addConsoleMessage({
        type: 'error',
        message: `Connection failed: ${error.message ?? String(error)}`,
      });
    }
  }, [setWallet, addConsoleMessage]);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      connected: false,
    });
    addConsoleMessage({ type: 'info', message: 'Wallet disconnected.' });
  }, [setWallet, addConsoleMessage]);

  const switchToSepolia = useCallback(async () => {
    try {
      const ethereum = getEthereum();
      if (!ethereum) return;

      addConsoleMessage({ type: 'info', message: 'Switching to Sepolia...' });

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // Error code 4902 means the chain has not been added
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK_PARAMS],
          });
        } else {
          throw switchError;
        }
      }

      addConsoleMessage({
        type: 'success',
        message: 'Switched to Sepolia network.',
      });
    } catch (error: any) {
      addConsoleMessage({
        type: 'error',
        message: `Failed to switch network: ${error.message ?? String(error)}`,
      });
    }
  }, [addConsoleMessage]);

  // Auto-detect account and chain changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet({
          address: null,
          balance: null,
          connected: false,
        });
        addConsoleMessage({ type: 'warning', message: 'Wallet disconnected by user.' });
      } else {
        try {
          const provider = new BrowserProvider(ethereum);
          const balance = await provider.getBalance(accounts[0]);
          setWallet({
            address: accounts[0],
            balance: balance.toString(),
            connected: true,
          });
          addConsoleMessage({
            type: 'info',
            message: `Account changed: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        } catch {
          setWallet({ address: accounts[0], connected: true });
        }
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setWallet({ chainId });
      addConsoleMessage({
        type: 'info',
        message: `Chain changed to ${chainId}`,
      });
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [setWallet, addConsoleMessage]);

  return {
    ...walletState,
    connect,
    disconnect,
    switchToSepolia,
    getProvider,
    getSigner,
  };
}
