import { RegistryContractFunctionParam } from 'hooks/Guilds/contracts/useContractRegistry';
import { useMemo } from 'react';
import AddressInput from '../common/Form/AddressInput';
import { FormElementProps } from '../common/Form/common';
import DateInput, { InputType } from '../common/Form/DateInput';
import Input from '../common/Form/Input';
import NumericalInput from '../common/Form/NumericalInput';
import Toggle from '../common/Form/Toggle';
import TokenAmountInput from '../common/Form/TokenAmountInput';

interface FormElementRendererProps extends FormElementProps<any> {
  param: RegistryContractFunctionParam;
}

const FormElementRenderer: React.FC<FormElementRendererProps> = ({
  param,
  value,
  onChange,
}) => {
  const FormElement: React.FC<FormElementProps<any>> = useMemo(() => {
    switch (param.component) {
      case 'address':
        return AddressInput;
      case 'integer':
      case 'decimal':
        return NumericalInput;
      case 'date':
      case 'time':
        return DateInput;
      case 'boolean':
        return Toggle;
      case 'tokenAmount':
        return TokenAmountInput;
      case 'contentHash':
        return Input;
      default:
        return Input;
    }
  }, [param]);

  const props = useMemo(() => {
    switch (param.component) {
      case 'date':
        return {
          isUTC: true,
          inputType: InputType.DATE,
        };
      case 'time':
        return {
          isUTC: true,
          inputType: InputType.DATETIME,
        };
      case 'tokenAmount':
        return {
          decimals: 18,
        };
      default:
        return {};
    }
  }, [param]);

  return <FormElement value={value} onChange={onChange} {...props} />;
};

export default FormElementRenderer;
