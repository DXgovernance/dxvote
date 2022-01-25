import { useWeb3React } from '@web3-react/core';
import { FiArrowUpRight, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styled from 'styled-components';
import { getChains } from '../../../../provider/connectors';
import { Transaction as TransactionInterface } from '../../../../types/types.guilds';
import { getBlockchainLink } from '../../../../utils';
import PendingCircle from '../../../common/PendingCircle';

const TransactionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid #c4c4c4;
`;

const Link = styled.a`
  text-decoration: none;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;

  svg {
    margin-left: 0.2rem;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Icon = styled.div`
  height: 1rem;
  width: 1rem;
`;

interface TransactionProps {
  transaction: TransactionInterface;
}

const Transaction: React.FC<TransactionProps> = ({ transaction }) => {
  const { chainId } = useWeb3React();
  const networkName = getChains().find(chain => chain.id === chainId).name;
  return (
    <TransactionContainer>
      <Link
        href={getBlockchainLink(transaction.hash, networkName)}
        target="_blank"
      >
        {transaction.summary} <FiArrowUpRight />
      </Link>
      <Icon>
        {!transaction.receipt ? (
          <PendingCircle height="16px" width="16px" color="#000" />
        ) : transaction.receipt?.status === 1 ? (
          <FiCheckCircle />
        ) : (
          <FiXCircle />
        )}
      </Icon>
    </TransactionContainer>
  );
};

export default Transaction;
