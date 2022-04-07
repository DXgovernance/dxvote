// Based on https://github.com/levelkdev/dxswap-dapp/blob/master/src/components/Input/NumericalInput/index.tsx

import React from 'react';
import Input from './Input';
import { escapeRegExp } from '../../../../utils';

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const NumericalInput = ({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number;
  onUserInput: (input: string) => void;
  error?: boolean;
  fontSize?: string;
  align?: 'right' | 'left';
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };

  return (
    <Input
      {...rest}
      value={value}
      onChange={event => {
        // replace commas with periods, because dxswap exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'));
      }}
      // universal input options
      inputMode="decimal"
      title="Token Amount"
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
