import '@testing-library/jest-dom';
import Permissions from './SetPermissionsEditor';
import { render } from 'utils/tests.js';
import { DecodedCall } from '../../types';
import { SupportedAction } from '../../types';
import ERC20Guild from '../../../../../contracts/ERC20Guild.json';
import { BigNumber, utils } from 'ethers';
import { ANY_FUNC_SIGNATURE, ANY_ADDRESS } from 'utils';
import { fireEvent, screen } from '@testing-library/react';

const ERC20GuildContract = new utils.Interface(ERC20Guild.abi);

const decodedCallMock: DecodedCall = {
  from: '0x0000000000000000000000000000000000000000',
  callType: SupportedAction.REP_MINT,
  function: ERC20GuildContract.getFunction('setPermission'),
  to: '',
  value: BigNumber.from(0),
  args: {
    asset: '',
    to: ANY_ADDRESS,
    functionSignature: ANY_FUNC_SIGNATURE,
    valueAllowed: BigNumber.from(150),
    allowance: true,
  },
};

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

describe('Set Permissions editor', () => {
  it('Default view renders asset transfer', () => {
    render(
      <Permissions decodedCall={decodedCallMock} updateCall={jest.fn()} />
    );
    expect(screen.getByText('Assets transfer')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('To address')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('Changing tabs to function calls shows its elements', () => {
    render(
      <Permissions decodedCall={decodedCallMock} updateCall={jest.fn()} />
    );

    const functionsCallTab = screen.getByText('Functions call');
    fireEvent.click(functionsCallTab);
    expect(screen.getByText('Functions call'));
    expect(screen.getByText('To address'));
    expect(screen.getByText('Function signature'));
  });
});
