import { FaSpinner } from 'react-icons/fa';
import styled from 'styled-components';

const TransactionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
`;

const Link = styled.a`
  text-decoration: none;
  font-size: 0.9rem;
`;

interface TransactionProps {
  children: string | JSX.Element | JSX.Element[];
  link: string;
  pending: boolean;
}

const Transaction: React.FC<TransactionProps> = ({ children, link, pending }) => {
  return (
    <TransactionContainer>
      <Link href={link}>
        {children}
      </Link>
      {pending && <FaSpinner />}
    </TransactionContainer>
  );
};

export default Transaction;
