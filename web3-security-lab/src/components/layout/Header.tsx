import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { useStore } from '@/store';

const SEPOLIA_CHAIN_ID = 11155111;

export function Header() {
  const { walletState } = useStore();
  const isSepolia = walletState.chainId === SEPOLIA_CHAIN_ID;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-secondary px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-accent">
          <Shield className="h-5 w-5" />
          <span className="text-lg font-bold tracking-tight text-text-primary">
            W3 Security Lab
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {walletState.connected && (
          <Badge variant={isSepolia ? 'success' : 'danger'}>
            {isSepolia ? 'Sepolia' : 'Wrong Network'}
          </Badge>
        )}
        <WalletConnect />
      </div>
    </header>
  );
}
