import styled from 'styled-components';
import PendingCircle from '../../../common/PendingCircle';

const TransactionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #C4C4C4;
`;

const Link = styled.a`
  text-decoration: none;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Spinner = styled.div`
  height: 1rem;
  width: 1rem;
`;

interface TransactionProps {
  children: string | JSX.Element | JSX.Element[];
  link: string;
  pending: boolean;
}

const Transaction: React.FC<TransactionProps> = ({
  children,
  link,
  pending,
}) => {
  return (
    <TransactionContainer>
      <Link href={link} target="_blank">{children}</Link>
      {pending && (
        <Spinner>
          <PendingCircle height="16px" width="16px" color="#000" />
        </Spinner>
      )}
    </TransactionContainer>
  );
};

export default Transaction;
