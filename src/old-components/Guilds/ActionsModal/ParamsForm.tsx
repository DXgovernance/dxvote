import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import {
  ActionsButton,
  FormElement,
  FormError,
  FormLabel,
  Wrapper,
} from './styles';
import { RichContractFunction } from 'hooks/Guilds/contracts/useRichContractRegistry';
import FormElementRenderer, {
  getDefaultValidationsByFormElement,
} from './FormElementRenderer';

const SubmitButton = styled(ActionsButton).attrs(() => ({
  variant: 'primary',
}))`
  background-color: ${({ theme }) => theme.colors.button.primary};
  justify-content: center;
`;

interface ParamsFormProps {
  fn: RichContractFunction;
  onSubmit: (args: Record<string, any>) => void;
}

const ParamsForm: React.FC<ParamsFormProps> = ({ fn, onSubmit }) => {
  const { control, handleSubmit } = useForm();

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
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

export default ParamsForm;
