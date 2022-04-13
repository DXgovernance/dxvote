import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { ActionsButton, FormElement, FormLabel, Wrapper } from './styles';
import { RegistryContractFunction } from 'hooks/Guilds/contracts/useContractRegistry';
import FormElementRenderer from './FormElementRenderer';

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
  const [values, setValues] = useState<{ [key: string]: any }>({});

  // Set initial values for the fields
  useEffect(() => {
    setValues(
      fn.params.reduce((acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      }, {})
    );
  }, [fn]);

  const setFieldValue = (fieldName: string, value: any) => {
    setValues({
      ...values,
      [fieldName]: value,
    });
  };

  return (
    <Wrapper>
      {fn.params.map(param => (
        <FormElement>
          <FormLabel>{param.description}</FormLabel>
          <FormElementRenderer
            param={param}
            value={values[param.name]}
            onChange={(value: any) => setFieldValue(param.name, value)}
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
