import styled from 'styled-components';
import { Button } from '../common/Button';
import { ContainerText } from '../common/Layout/Text';

export const Wrapper = styled.div`
  width: 100%;
`;

export const SectionWrapper = styled.div`
  margin: 1.5rem;
`;

export const ActionsButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
  background-color: transparent;
  padding: ${({ vertical }) => (vertical ? '1rem' : '0.75rem 1rem')};
  width: 100%;
  display: flex;
  align-items: ${({ vertical }) => (vertical ? 'flex-start' : 'center')};
  justify-content: space-between;
  flex-direction: ${({ vertical }) => (vertical ? 'column' : 'row')};
  border-radius: ${({ vertical }) => (vertical ? '0.625rem' : '2rem')};
  &:active,
  &:focus {
    border: 2px solid ${({ theme }) => theme.colors.text};
  }
`;

export const SectionTitle = styled(ContainerText).attrs(() => ({
  variant: 'bold',
}))`
  display: block;
  color: ${({ theme }) => theme.colors.proposalText.grey};
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
`;

export const ButtonLabel = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonDetail = styled(ContainerText).attrs(() => ({
  variant: 'medium',
}))`
  margin: ${({ vertical }) => (vertical ? '0.5rem 0 0 0' : '0')};
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

export const FormElement = styled.div`
  margin: 1.5rem;
`;

export const FormLabel = styled.div`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  margin-bottom: 0.75rem;
`;
