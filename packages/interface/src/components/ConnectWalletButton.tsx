import { useAccount, useConnect } from 'wagmi';
import { ReactNode, useCallback } from 'react';
import { PrimaryButton } from '@/components/Button';

interface ConnectWalletButtonProps {
  onAfterConnect?: () => void;
  children?: ReactNode;
}

export default function ConnectWalletButton({
  onAfterConnect,
  children,
}: ConnectWalletButtonProps) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const handleConnect = useCallback(() => {
    console.log(connectors);
    const connector = connectors.find(
      (connector) => connector.id === 'injected'
    );
    console.log(connector);
    connect({ connector: connector });
  }, [connect, isConnected]);
  if (isConnected) {
    return <PrimaryButton onClick={onAfterConnect}>{children}</PrimaryButton>;
  }
  return (
    <PrimaryButton onClick={handleConnect}>{'CONNECT WALLET'}</PrimaryButton>
  );
}
