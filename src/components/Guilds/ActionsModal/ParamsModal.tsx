import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import {
  ActionsButton,
  FormElement,
  FormError,
  FormLabel,
  Wrapper,
} from './styles';
import { RegistryContractFunction } from 'hooks/Guilds/contracts/useContractRegistry';
import FormElementRenderer, {
  getDefaultValidationsByFormElement,
} from './FormElementRenderer';

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
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => console.log(data);

  return (
    <Wrapper>
      <form
        onSubmit={handleSubmit(onSubmit, errors => {
          console.log(errors);
        })}
      >
        {fn.params.map(param => (
          <FormElement key={param.name}>
            <FormLabel>{param.description}</FormLabel>
            <Controller
              name={param.name}
              control={control}
              defaultValue={param.defaultValue}
              rules={getDefaultValidationsByFormElement(param)}
              render={({ field, fieldState }) => (
                <>
                  <FormElementRenderer
                    param={param}
                    {...field}
                    isInvalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FormError>{fieldState.error.message}</FormError>
                  )}
                </>
              )}
            />
          </FormElement>
        ))}

        <FormElement>
          <SubmitButton type="submit">Add action</SubmitButton>
        </FormElement>
      </form>
    </Wrapper>
  );
};

export default ParamsModal;
