import React from 'react';
import styled from 'styled-components';
import { useCopyClipboard } from '../../utils/helperHooks';

import Link from '../../components/common/Link';
import { FiCopy, FiCheckCircle } from "react-icons/fi";

const CopyIcon = styled(Link)`
  color: ${({ theme }) => theme.silverGray};
  flex-shrink: 0;
  margin-right: 1rem;
  margin-left: 0.5rem;
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

export default function CopyHelper({ toCopy }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(toCopy)}>
      <TransactionStatusText>
        {isCopied ? (
          <FiCheckCircle />
        ) : (
          <FiCopy />
        )}
      </TransactionStatusText>
    </CopyIcon>
  );
}
