// Based on https://github.com/levelkdev/dxswap-dapp/blob/master/src/components/Input/NumericalInput/index.tsx

import React from 'react';
import Input, { InputProps } from './Input';
import { escapeRegExp } from '../../../../utils';

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const NumericalInput: React.FC<InputProps<string>> = ({
  value,
  onChange,
  placeholder,
  ...rest
}) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onChange(nextUserInput);
    }
  };

  return (
    <Input
      {...rest}
      value={value}
      onChange={event => {
        // replace commas with periods, because Guilds exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'));
      }}
      // universal input options
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  );
};

export default NumericalInput;
