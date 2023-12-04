import { Button } from 'antd';
import styled from 'styled-components';
import React, {ReactNode, useCallback, useMemo} from 'react';
import {useAccount, useConnect, useNetwork, useSwitchNetwork} from "wagmi";
import {useRouter} from "next/navigation";

export const BaseButton = styled(Button)`
  width: 100%;
  height: 100%;
  color: #000000;
  font-size: 21px;
  font-weight: bold;
  text-transform: uppercase;
  font-family: 'Space Grotesk', sans-serif;
  border-radius: 4px;
`;

export const Primary2Button = styled(BaseButton)`
  border: 1px solid #fffd8c;
  background: #fffd8c;
  text-transform: none;
  font-family: 'Work Sans', sans-serif;
`;

export const SelectedButton = styled(BaseButton)`
  color: #29ffef;
  background-color: rgba(
    255,
    255,
    255,
    0.298
  ); /* Adjusted for correct opacity */
  /* Tailwind class: backdrop-blur-[10px] */
  backdrop-filter: blur(10px);

  /* Tailwind class: backdrop-brightness-[100%] */
  -webkit-backdrop-filter: brightness(100%);

  /* Tailwind class: [-webkit-backdrop-filter:blur(10px)_brightness(100%)] */
  -webkit-backdrop-filter: blur(10px) brightness(100%);
`;

export const UnSelectedButton = styled(SelectedButton)`
  color: #000000;
`;

export const PrimaryButton = styled(BaseButton)`
  background: #79fff5;
`;

export const NavButton = styled(BaseButton)`
  color: #fff;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  padding: 0px 0px 0px 0px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2.5px);
  white-space: pre-line;
`;

interface SelectingButtonProps {
  selected: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function SelectingButton({
  selected,
  onClick,
  children,
}: SelectingButtonProps) {
  return (
    <>
      {selected ? (
        <SelectedButton onClick={onClick}>{children}</SelectedButton>
      ) : (
        <UnSelectedButton onClick={onClick}>{children}</UnSelectedButton>
      )}
    </>
  );
}

interface SpecificChainButtonProps {
  chainId: number;
  onClick: () => void;
  children: React.ReactNode;
}

export function SpecificChainButton({chainId,onClick,children}:SpecificChainButtonProps){
  const {chain}=useNetwork()
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchNetwork } = useSwitchNetwork();
  const isCorrectChain = useMemo(() => {
    return chain?.id === chainId;
  }, [chain]);
  const router = useRouter();
  const handleChangeChain = useCallback(
      () => {
        if (chain?.id === chainId) {
          return;
        }
        switchNetwork?.(chainId);
      },
      [switchNetwork, chain]
  );
  const handleConnect = useCallback(() => {
    console.log(connectors);
    const connector = connectors.find(
        (connector) => connector.id === 'injected'
    );
    console.log(connector);
    connect({ connector: connector });
  }, [connect, isConnected]);
  return(
      isConnected?
          (isCorrectChain?
              <Primary2Button onClick={onClick}>{children}</Primary2Button>:
              <Primary2Button onClick={handleChangeChain}>Switch Network</Primary2Button>):
          <Primary2Button onClick={handleConnect}>Connect Wallet</Primary2Button>
  )
}
