import { RegistryContractFunctionParam } from 'hooks/Guilds/contracts/useContractRegistry';
import { useMemo } from 'react';
import AddressInput from '../common/Form/AddressInput';
import { FormElementProps } from '../common/Form/common';
import DateInput from '../common/Form/DateInput';
import Input from '../common/Form/Input';
import NumericalInput from '../common/Form/NumericalInput';
import Toggle from '../common/Form/Toggle';

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
        return NumericalInput;
      case 'contentHash':
        return Input;
      default:
        return Input;
    }
  }, [param]);

  return <FormElement value={value} onChange={onChange} />;
};

export default FormElementRenderer;
