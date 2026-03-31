import { Wallet, LogOut, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { useWallet } from '@/hooks/useWallet';

const SEPOLIA_CHAIN_ID = 11155111;

export function WalletConnect() {
  const { address, balance, chainId, connected, connect, disconnect, switchToSepolia } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID;
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';
  const formattedBalance = balance
    ? `${(Number(balance) / 1e18).toFixed(4)} ETH`
    : '';

  if (!connected) {
    return (
      <Button variant="outline" size="sm" onClick={connect}>
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary transition-colors hover:border-accent cursor-pointer"
      >
        <div className="h-2 w-2 rounded-full bg-success" />
        <span className="font-mono text-xs">{truncatedAddress}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-bg-secondary p-3 shadow-lg">
          <div className="mb-3 space-y-1 border-b border-border pb-3">
            <div className="text-xs text-text-muted">Address</div>
            <div className="font-mono text-xs text-text-primary">{truncatedAddress}</div>
            {formattedBalance && (
              <>
                <div className="mt-2 text-xs text-text-muted">Balance</div>
                <div className="text-sm text-text-primary">{formattedBalance}</div>
              </>
            )}
            <div className="mt-2">
              <Badge variant={isSepolia ? 'success' : 'danger'}>
                {isSepolia ? 'Sepolia' : `Chain ${chainId}`}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {!isSepolia && (
              <button
                onClick={() => {
                  switchToSepolia();
                  setMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-warning',
                  'hover:bg-bg-tertiary transition-colors cursor-pointer',
                )}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Switch to Sepolia
              </button>
            )}
            <button
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-danger',
                'hover:bg-bg-tertiary transition-colors cursor-pointer',
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
