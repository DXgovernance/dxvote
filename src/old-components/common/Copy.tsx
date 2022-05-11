import { useCopyClipboard } from '../../utils';
import Link from './Link';
import { FiCopy, FiCheckCircle } from 'react-icons/fi';
import styled from 'styled-components';

const CopyIcon = styled(Link)`
  color: ${({ theme }) => theme.silverGray};
  flex-shrink: 0;
  margin-right: 1rem;
  margin-left: 0rem;
  text-decoration: none;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.doveGray};
  }
`;
const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`;

export default function CopyHelper({ toCopy, children = null }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(toCopy)}>
      <TransactionStatusText>
        {children} {isCopied ? <FiCheckCircle /> : <FiCopy />}
      </TransactionStatusText>
    </CopyIcon>
  );
}
