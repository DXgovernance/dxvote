import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout';
import { Heading } from 'old-components/Guilds/common/Typography';

// TODO: base these components on a generic Card component
export const CardWrapper = styled(Box)`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  margin-bottom: 1rem;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const CardHeader = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const CardContent = styled(Box)`
  margin: 1rem 0;
`;

export const CardFooter = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  @media only screen and (max-width: 524px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const CardTitle = styled(Heading)`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  @media only screen and (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const IconDetailWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const Detail = styled(Box)`
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

export const ActionsWrapper = styled(Box)`
  display: flex;
  flex: 1;
  margin-right: 24px;
  position: relative;
  overflow-x: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) =>
      `linear-gradient(to right, transparent 89%, ${theme.colors.background} 100%)`};
  }
  & > div {
    margin: 4px 2px;
  }
  @media only screen and (max-width: 524px) {
    flex-wrap: wrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    & > div:nth-child(n + 3) {
      display: none;
    }
    &::before {
      content: none;
    }
  }
`;

export const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
  width: fit-content;
`;

export const NotFoundActionWrapper = styled.div`
  display: flex;
  padding: 4px;
  border: ${({ theme }) => `1px solid ${theme.colors.red}`};
  border-radius: 30px;
`;

export const Icon = styled.img<{
  spaceLeft?: boolean;
  spaceRight?: boolean;
  bordered: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.spaceLeft && `margin-left: 0.5rem;`}
  ${props => props.spaceRight && `margin-right: 0.5rem;`}

  ${props =>
    props.bordered &&
    `
    border: 1px solid #000;
    border-radius: 50%;
  `}
`;

export const VoteInfoWrapper = styled(Box)`
  min-width: unset;
`;
