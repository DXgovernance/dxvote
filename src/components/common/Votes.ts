import styled from 'styled-components';

export const Positive = styled.span`
  color: ${({ theme }) => theme.votes.positive.textColor};
`;

export const Negative = styled.span`
  color: ${({ theme }) => theme.votes.negative.textColor};
`;

export const Separator = styled.span`
  margin-left: 2px;
  margin-right: 2px;
`;

export const AmountBadge = styled.span`
  background-color: ${props => props.color || 'inherit'};
  border-radius: 50%;
  color: white;
  padding: 2px 6px;
  text-align: center;
  margin: 5px;
`;

export const HorizontalSeparator = styled.div`
  margin: 5px;
  border-bottom: ${({theme}) => theme.votes.horizontalSeparatorBorder};
`;