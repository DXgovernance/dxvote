import styled from 'styled-components';
import WalletInfoBox from './WalletInfoBox';

const OptionButton = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid var(--active-button-border);
  background-color: var(--blue-text);
  color: #ffffff;
  padding: 8px 24px;

  &:hover {
    cursor: pointer;
    border: 1px solid var(--blue-onHover-border);
    background-color: var(--blue-onHover);
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
      font-size: 12px;
    `};
`;

const ConnectButtonRow = styled.div`
  align-items: center;
  justify-content: center;
  margin: 30px;
  border-top: 1px solid ${({ theme }) => theme.colors.text};
`;

interface Props {
  openOptions: any;
}

export default function AccountDetails({ openOptions }: Props) {
  return (
    <>
      <WalletInfoBox openOptions={openOptions} />

      <ConnectButtonRow>
        <OptionButton
          onClick={() => {
            openOptions();
          }}
        >
          Connect to a different wallet
        </OptionButton>
      </ConnectButtonRow>
    </>
  );
}
