import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import moment, { Moment } from 'moment';
import { RegisterOptions } from 'react-hook-form';

import { RichContractFunctionParam } from 'hooks/Guilds/contracts/useRichContractRegistry';
import { isAddress } from 'utils';
import AddressInput from 'old-components/Guilds/common/Form/AddressInput';
import { FormElementProps } from 'old-components/Guilds/common/Form/common';
import DateInput, {
  InputType,
} from 'old-components/Guilds/common/Form/DateInput';
import Input from 'old-components/Guilds/common/Form/Input';
import NumericalInput from 'old-components/Guilds/common/Form/NumericalInput';
import Toggle from 'old-components/Guilds/common/Form/Toggle';
import TokenAmountInput from 'old-components/Guilds/common/Form/TokenAmountInput';

interface FormElementRendererProps extends FormElementProps<any> {
  param: RichContractFunctionParam;
}

const FormElementRenderer: React.FC<FormElementRendererProps> = ({
  param,
  value,
  onChange,
  ...remainingProps
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
          value: value ? moment.unix(BigNumber.from(value).toNumber()) : value,
          onChange: (value: Moment) => onChange(BigNumber.from(value?.unix())),
        };
      case 'time':
        return {
          isUTC: true,
          inputType: InputType.DATETIME,
          value: value ? moment.unix(BigNumber.from(value).toNumber()) : value,
          onChange: (value: Moment) => onChange(BigNumber.from(value?.unix())),
        };
      case 'tokenAmount':
        return {
          decimals: 18,
        };
      default:
        return {};
    }
  }, [param, value, onChange]);

  return (
    <FormElement
      value={value}
      onChange={onChange}
      {...props}
      {...remainingProps}
    />
  );
};

type Validations = Omit<
  RegisterOptions,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export const getDefaultValidationsByFormElement = (
  param: RichContractFunctionParam
) => {
  const validations: Validations = { required: 'This field is required.' };

  switch (param.component) {
    case 'address':
      validations.validate = (value: string) =>
        !!isAddress(value) || 'Invalid address.';
      break;
    case 'tokenAmount':
      validations.validate = (value: BigNumber) =>
        (value && value.gte(0)) || 'Token amount should not be negative.';
      break;
  }

  return validations;
};

export default FormElementRenderer;
