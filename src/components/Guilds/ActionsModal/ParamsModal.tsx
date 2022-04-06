import styled from 'styled-components';
import { Input } from '../common/Form';
import { useState } from 'react';
import { ActionsButton, FormElement, FormLabel, Wrapper } from './styles';
import { RegistryContractFunction } from 'hooks/Guilds/contracts/useContractRegistry';

const SubmitButton = styled(ActionsButton).attrs(() => ({
  variant: 'primary',
}))`
  background-color: ${({ theme }) => theme.colors.button.primary};
  justify-content: center;
`;

interface ParamsModalProps {
  fn: RegistryContractFunction;
}

const ParamsModal: React.FC<ParamsModalProps> = ({ fn }) => {
  const [address, setAddress] = useState('');

  return (
    <Wrapper>
      {fn.params.map(param => (
        <FormElement>
          <FormLabel>{param.description}</FormLabel>
          <Input
            placeholder={param.defaultValue}
            value={address}
            onChange={e => setAddress(e.target.value)}
            size={24}
          />
        </FormElement>
      ))}

      <FormElement>
        <SubmitButton>Add action</SubmitButton>
      </FormElement>
    </Wrapper>
  );
};

export default ParamsModal;
