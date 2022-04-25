// import { RegistryContract } from 'hooks/Guilds/contracts/useContractRegistry';
import { useState, useMemo } from 'react';
import { SectionTitle, SectionWrapper, Wrapper } from './styles';
import styled from 'styled-components';

import { BlockButton } from '.';
import { FiChevronDown } from 'react-icons/fi';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import Input from 'components/Guilds/common/Form/Input';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import { useWeb3React } from '@web3-react/core';
import Avatar from 'components/Guilds/Avatar';
import { resolveUri } from 'utils/url';

import { BigNumber } from 'ethers';
import TokenPicker from 'components/Guilds/TokenPicker';
import { Box } from 'components/Guilds/common/Layout';
import TokenAmountInput from 'components/Guilds/common/Form/TokenAmountInput';
const ControlRow = styled(Box)`
  display: flex;
  align-items: stretch;
  height: 100%;
`;

const Control = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.75rem 0;
  width: 100%;
`;

const ControlLabel = styled(Box)`
  margin-bottom: 0.75rem;
`;

const Spacer = styled(Box)`
  margin-right: 1rem;
`;

interface TokensToSpendProps {
  onConfirm: ({ amount, token }: { amount: BigNumber; token: string }) => void;
}

const TokensToSpend: React.FC<TokensToSpendProps> = ({ onConfirm }) => {
  const { chainId } = useWeb3React();

  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);
  const [amount, setAmount] = useState<BigNumber>(null);
  const [token, setToken] = useState<string>(null);

  const { tokens } = useTokenList(chainId);
  const selectedToken = useMemo(() => {
    if (!token || !tokens) return null;

    return tokens.find(({ address }) => address === token);
  }, [tokens, token]);

  // TODO: tokenInfo not working for devscript
  const { data: tokenInfo } = useERC20Info(token);

  const confirm = () => {
    if (!amount || !token) return; // TODO: validate
    onConfirm({
      amount,
      token,
    });
  };

  return (
    <Wrapper>
      <SectionWrapper>
        <SectionTitle>Select tokens to spend</SectionTitle>
        <ControlRow>
          <Control>
            <ControlLabel>Amount</ControlLabel>
            <ControlRow>
              <TokenAmountInput
                decimals={tokenInfo?.decimals}
                value={amount}
                onChange={setAmount}
              />
            </ControlRow>
          </Control>

          <Spacer />

          <Control>
            <ControlLabel>Asset</ControlLabel>
            <ControlRow onClick={() => setIsTokenPickerOpen(true)}>
              <Input
                value={tokenInfo?.symbol || ''}
                placeholder="Token"
                icon={
                  <div>
                    {token && (
                      <Avatar
                        src={resolveUri(selectedToken?.logoURI)}
                        defaultSeed={token}
                        size={18}
                      />
                    )}
                  </div>
                }
                iconRight={<FiChevronDown size={24} />}
              />
            </ControlRow>
          </Control>
        </ControlRow>

        <TokenPicker
          // walletAddress={''}
          isOpen={isTokenPickerOpen}
          onClose={() => setIsTokenPickerOpen(false)}
          onSelect={tokenAddress => {
            console.log('tokenAddress', tokenAddress);
            setToken(tokenAddress);
            setIsTokenPickerOpen(false);
          }}
        />

        <BlockButton primary onClick={confirm} disabled={!amount || !token}>
          Approve
        </BlockButton>
      </SectionWrapper>
    </Wrapper>
  );
};

export default TokensToSpend;
