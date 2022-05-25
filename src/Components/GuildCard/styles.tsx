import styled, { css } from 'styled-components';
import { Flex, Box } from 'Components/Primitives/Layout/index';
import { Heading } from 'old-components/Guilds/common/Typography';

export const cardWrapperStyles = css`
  margin-bottom: 1rem;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
  width: 18%;
  min-width: 229px;
  height: 216px;
  padding: 24px 24px 40px 24px;
  @media (max-width: 768px) {
    flex: 1 0 auto;
    margin: 2rem;
  }
`;

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

export const MemberNumberWrapper = styled.div`
  padding-left: 7px;
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

export const DaoIcon = styled.img`
  height: 4rem;
  width: 4rem;
`;

export const Content = styled(Box)`
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const DaoTitle = styled(Heading)`
  margin-left: 4px;
  line-height: 24px;
`;
