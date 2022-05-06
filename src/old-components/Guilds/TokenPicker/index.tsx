import { FiSearch } from 'react-icons/fi';
import styled from 'styled-components';
import Input from '../common/Form/Input';
import { Modal } from '../common/Modal';
import { useWeb3React } from '@web3-react/core';
import Avatar from '../Avatar';
import { TokenInfo } from '@uniswap/token-lists';
import { resolveUri } from 'utils/url';
import {
  TokenWithBalance,
  useAllERC20Balances,
} from 'hooks/Guilds/ether-swr/erc20/useAllERC20Balances';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { Loading } from '../common/Loading';
import useMiniSearch from 'hooks/useMiniSearch';
import { useEffect, useMemo, useState } from 'react';

const TokenPickerContainer = styled.div`
  margin: 2rem;
`;

const SearchWrapper = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  border-radius: 0.5rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const TokenIcon = styled.div`
  margin-right: 1rem;
`;

const TokenDetail = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TokenTicker = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.header1};
  padding-bottom: 0.1rem;
`;

const TokenName = styled.div`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: ${({ theme }) => theme.fontSizes.label};
`;

interface TokenProps {
  token: TokenWithBalance;
  amount?: number;
  onSelect: (token: TokenInfo) => void;
}

const Token: React.FC<TokenProps> = ({ token, onSelect }) => {
  const roundedBalance = useBigNumberToNumber(
    token?.balance,
    token?.decimals,
    3
  );

  return (
    <TokenItem onClick={() => onSelect(token)}>
      <TokenDetail>
        <TokenIcon>
          <Avatar
            src={resolveUri(token.logoURI)}
            defaultSeed={token.address}
            size={28}
          />
        </TokenIcon>
        <div>
          <TokenTicker>{token.symbol}</TokenTicker>
          <TokenName>{token.name}</TokenName>
        </div>
      </TokenDetail>
      <div>
        {roundedBalance !== undefined ? roundedBalance : <Loading loading />}
      </div>
    </TokenItem>
  );
};

type TokenWithBalanceIndexable = TokenWithBalance & { id: string };

interface TokenPickerProps {
  walletAddress?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tokenAddress: string) => void;
}

const TokenPicker: React.FC<TokenPickerProps> = ({
  walletAddress,
  isOpen,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { account } = useWeb3React();
  const { data } = useAllERC20Balances(walletAddress || account);

  const { instance, buildIndex, query } =
    useMiniSearch<TokenWithBalanceIndexable>({
      fields: ['name', 'symbol', 'address'],
      storeFields: ['address'],
      searchOptions: {
        fuzzy: 2,
        prefix: true,
      },
    });

  const tokens = useMemo(() => {
    return data.map(token => {
      return {
        ...token,
        id: token?.address,
      };
    });
  }, [data]);

  useEffect(() => {
    if (instance?.documentCount !== tokens?.length) {
      buildIndex(tokens);
    }
  }, [buildIndex, tokens, instance]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];

    return query({ queries: [searchQuery] });
  }, [searchQuery, query]);

  return (
    <Modal
      header={'Select a token'}
      isOpen={isOpen}
      onDismiss={onClose}
      maxWidth={390}
    >
      <TokenPickerContainer>
        <SearchWrapper>
          <Input
            icon={<FiSearch />}
            placeholder="Search token"
            value={searchQuery}
            onChange={e => setSearchQuery(e?.target?.value)}
          />
        </SearchWrapper>
        <TokenList>
          {(searchQuery ? searchResults : data)?.slice(0, 4).map(token => (
            <Token
              key={token.address}
              token={token}
              onSelect={() => onSelect(token.address)}
            />
          ))}
        </TokenList>
      </TokenPickerContainer>
    </Modal>
  );
};

export default TokenPicker;
