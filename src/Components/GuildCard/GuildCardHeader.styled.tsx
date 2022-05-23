import styled from 'styled-components';
import { Flex, Box } from 'Components/Primitives/Layout/index';

export const Header = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
`;

export const MemberWrapper = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.card.grey};
`;

export const ProposalsInformation = styled(Box)<{ proposals?: string }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
  border-radius: 15px;
  border: 1px solid
    ${({ proposals, theme }) =>
      proposals === 'active'
        ? theme.colors.card.green
        : theme.colors.card.grey};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ proposals, theme }) =>
    proposals === 'active' ? theme.colors.card.green : theme.colors.card.grey};
  padding: 0.25rem 0.4rem;
`;
