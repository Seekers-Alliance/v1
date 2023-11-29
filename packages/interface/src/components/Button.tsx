import { Button } from 'antd';
import styled from 'styled-components';
import { ReactNode } from 'react';

export const BaseButton = styled(Button)`
  width: 100%;
  height: 100%;
  font-size: 21px;
  font-weight: bold;
  text-transform: uppercase;
  font-family: 'Space Grotesk', sans-serif;
  border-radius: 4px;
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
