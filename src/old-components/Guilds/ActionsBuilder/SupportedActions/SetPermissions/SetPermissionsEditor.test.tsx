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

// Mocked variables

const ERC20GuildContract = new utils.Interface(ERC20Guild.abi);

const decodedFunctionSignatureMock = 'test';
const encodedFunctionSignatureMock = '0x9c22ff5f';
const toAddressMock = '0x79706C8e413CDaeE9E63f282507287b9Ea9C0928';
const customAmountMock = 150;

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
    asset: '',
    to: toAddressMock,
    functionSignature: encodedFunctionSignatureMock,
    valueAllowed: BigNumber.from(customAmountMock),
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
        screen.getByRole('textbox', { name: /asset input/i })
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
      expect(customAmountElement.value).toBe('150.0');
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

      const toAddressElement: HTMLInputElement = screen.getByRole('textbox', {
        name: /to address input/i,
      });

      const amountInput: HTMLInputElement = screen.getByRole('textbox', {
        name: /amount input/i,
      });

      console.log(amountInput.value);

      expect(toAddressElement.value).toBe(completeDecodedCallMock.args.to);
      // expect(amountInput.value).toBe(completeDecodedCallMock.args.valueAllowed);
    });

    it(`Toggling max amount disables the 'amount' input`, () => {});
    it(`Toggling max amount doesn't modifies the amount input`, () => {});
    it(`PENDING: asset interaction`, () => {});
  });

  describe(`Function calls tests`, () => {
    it(`Can fill the to address and function signature`, () => {});
    it(`Function signature is properly encoded to bytes4`, () => {});
    it(`Displays decodedCall information properly`, () => {});
  });

  describe(`Tab interaction`, () => {
    it(`Changing tabs to function calls shows its elements`, () => {
      render(
        <Permissions
          decodedCall={emptyDecodedCallMock}
          updateCall={jest.fn()}
        />
      );

      const functionsCallTab = screen.getByText(`Functions call`);
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
