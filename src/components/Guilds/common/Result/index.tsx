import { createElement } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiHelpCircle,
  FiXOctagon,
} from 'react-icons/fi';
import styled, { useTheme } from 'styled-components';
import { Box } from '../Layout';
import { Heading } from '../Typography';

export enum ResultState {
  SUCCESS,
  ERROR,
  WARNING,
  INFO,
}

interface ResultProps {
  state: ResultState;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

const ResultWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled(Heading)`
  margin-bottom: 0;
`;

const Subtitle = styled(Heading)`
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const IconMap = {
  [ResultState.SUCCESS]: FiCheckCircle,
  [ResultState.ERROR]: FiXOctagon,
  [ResultState.INFO]: FiHelpCircle,
  [ResultState.WARNING]: FiAlertTriangle,
};

const Result: React.FC<ResultProps> = ({
  title,
  state,
  icon,
  subtitle,
  extra,
}) => {
  const theme = useTheme();
  return (
    <ResultWrapper>
      {icon ||
        createElement(IconMap[state], {
          size: 32,
          color:
            state === ResultState.ERROR
              ? theme?.colors?.red
              : theme?.colors?.primary,
        })}
      <Title size="2">{title}</Title>
      <Subtitle size="1">{subtitle}</Subtitle>
      {extra}
    </ResultWrapper>
  );
};

export default Result;
