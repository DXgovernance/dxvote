import '@testing-library/jest-dom';
import Permissions from './SetPermissionsEditor';
import { render } from 'utils/tests.js';
import { DecodedCall } from '../../types';
import { SupportedAction } from '../../types';
import ERC20Guild from '../../../../../contracts/ERC20Guild.json';
import { BigNumber, utils } from 'ethers';
import { ANY_FUNC_SIGNATURE, ANY_ADDRESS } from 'utils';
import { fireEvent, screen } from '@testing-library/react';

// Mocked hooks

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

jest.mock('hooks/Guilds/ether-swr/useEtherSWR.ts', () => ({
  __esModule: true,
  default: () => ({
    getNetwork: 'eth',
  }),
}));

jest.mock('hooks/Guilds/useNetworkConfig.ts', () => ({
  __esModule: true,
  default: () => ({}),
}));

// Mocked variables

const ERC20GuildContract = new utils.Interface(ERC20Guild.abi);

const functionSignatureMock = 'test';
const encodedFunctionSignatureMock = '0x9c22ff5f';
const toAddressMock = '0x79706C8e413CDaeE9E63f282507287b9Ea9C0928';
const customAmountMock = 111;
const tokenAddresMock = '0xD899Be87df2076e0Be28486b60dA406Be6757AfC';

const emptyDecodedCallMock: DecodedCall = {
  from: '',
  callType: SupportedAction.REP_MINT,
  function: ERC20GuildContract.getFunction('setPermission'),
  to: '',
  value: BigNumber.from(0),
  args: {
    asset: '',
    to: ANY_ADDRESS,
    functionSignature: ANY_FUNC_SIGNATURE,
    valueAllowed: BigNumber.from(0),
    allowance: true,
  },
};

const completeDecodedCallMock: DecodedCall = {
  from: '',
  callType: SupportedAction.REP_MINT,
  function: ERC20GuildContract.getFunction('setPermission'),
  to: '',
  value: BigNumber.from(0),
  args: {
    asset: tokenAddresMock,
    to: toAddressMock,
    functionSignature: encodedFunctionSignatureMock,
    valueAllowed: BigNumber.from('111000000000000000000'),
    allowance: true,
  },
};

describe(`Set Permissions editor`, () => {
  describe(`Asset transfer tests`, () => {
    beforeAll(() => {});
    it(`Default view renders asset transfer`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      expect(
        screen.getByRole('textbox', { name: /asset picker/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('textbox', { name: /to address input/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('textbox', { name: /amount input/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('switch', { name: /toggle max value/i })
      ).toBeInTheDocument();
    });

    it(`Can fill 'To address' and 'custom amount'`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });
      fireEvent.change(toAddressElement, { target: { value: toAddressMock } });

      const customAmountElement: HTMLInputElement = screen.getByRole(
        'textbox',
        {
          name: /amount input/i,
        }
      );
      fireEvent.change(customAmountElement, {
        target: { value: customAmountMock },
      });

      expect(toAddressElement.value).toBe(toAddressMock);
      expect(customAmountElement.value).toBe('111.0');
    });

    it(`Clicking the X clears the to address`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });
      fireEvent.change(toAddressElement, { target: { value: toAddressMock } });

      const clearInputIcon = screen.getByLabelText('clear field to address');
      fireEvent.click(clearInputIcon);

      expect(toAddressElement.value).toBe('');
    });

    it(`Displays decodedCall information properly`, () => {
      render(
        <Permissions
          decodedCall={completeDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      // ! Token picker decoding not working correctly

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });

      const amountInputElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /amount input/i,
      });

      expect(toAddressElement.value).toBe(completeDecodedCallMock.args.to);
      expect(amountInputElement.value).toBe('111.0');
    });

    it(`Toggling max amount disables the 'amount' input`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const amountInput: HTMLInputElement = screen.getByRole('textbox', {
        name: /amount input/i,
      });
      const toggleMaxValueElement = screen.getByRole('switch', {
        name: /toggle max value/i,
      });

      fireEvent.click(toggleMaxValueElement);
      expect(amountInput).toBeDisabled();
    });

    it(`Toggling max amount doesn't modifies the amount input`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const customAmountElement: HTMLInputElement = screen.getByRole(
        'textbox',
        {
          name: /amount input/i,
        }
      );
      fireEvent.change(customAmountElement, {
        target: { value: customAmountMock },
      });

      const toggleMaxValueElement = screen.getByRole('switch', {
        name: /toggle max value/i,
      });

      // Asserts value is maintaned when disabled and enabled again
      fireEvent.click(toggleMaxValueElement);
      expect(customAmountElement.value).toBe('111.0');
      fireEvent.click(toggleMaxValueElement);
      expect(customAmountElement.value).toBe('111.0');
    });
  });

  describe(`Function calls tests`, () => {
    it(`Can fill the 'to address' and 'function signature'`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );
      const functionsCallTab = screen.getByLabelText(`functions call tab`);
      fireEvent.click(functionsCallTab);

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });
      fireEvent.change(toAddressElement, {
        target: { value: toAddressMock },
      });

      const functionSignatureElement: HTMLInputElement = screen.getByRole(
        'textbox',
        { name: /function signature input/i }
      );
      fireEvent.change(functionSignatureElement, {
        target: { value: functionSignatureMock },
      });

      expect(toAddressElement.value).toBe(toAddressMock);
      expect(functionSignatureElement.value).toBe(functionSignatureMock);
    });

    it(`Displays decodedCall information properly`, () => {
      render(
        <Permissions
          decodedCall={completeDecodedCallMock}
          updateCall={jest.fn()}
        />
      );
      const functionsCallTab = screen.getByLabelText(`functions call tab`);
      fireEvent.click(functionsCallTab);

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });

      const functionSignatureElement: HTMLInputElement = screen.getByRole(
        'textbox',
        { name: /function signature input/i }
      );

      expect(toAddressElement.value).toBe(completeDecodedCallMock.args.to);
      // expect(functionSignatureElement.value).toBe(decodedFunctionSignatureMock);
    });
  });

  describe(`Tab interaction`, () => {
    it(`Changing tabs to function calls shows its elements`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const functionsCallTab = screen.getByLabelText(`functions call tab`);
      fireEvent.click(functionsCallTab);
      expect(screen.getByText(`Functions call`));
      expect(screen.getByText(`To address`));
      expect(screen.getByText(`Function signature`));
    });

    it(`'To address' persists when changing tabs`, () => {});
    it(`'Asset' and 'amount' persists when switching tabs`, () => {});
    it(`'Toggle max value' persist when switching tabs`, () => {});
  });
});
