import React from 'react';
// import { screen, fireEvent } from '@testing-library/react';
import ActionsModal from './ActionsModal';
import { render } from 'utils/tests';
// import { utils } from 'ethers';
// import ERC20ABI from 'abis/ERC20.json';

jest.mock('contexts/index', () => jest.fn());
jest.mock('hooks/Guilds/guild/useGuildImplementationType', () => ({
  __esModule: true,
  default: () => ({
    type: 'SnapshotERC20Guild',
    bytecode_hash:
      '0x8f98f6ff8bd58d9c9d7750c4f78c9400cf6eecbf630b94f5e481b3c7ec10ccac',
    features: ['SNAPSHOT'],
    isRepGuild: true,
    isSnapshotGuild: false,
    isSnapshotRepGuild: false,
  }),
}));

describe('ActionsModal', () => {
  let props;
  beforeEach(() => {
    // jest.clearAllMocks();
    props = {
      isOpen: false,
      setIsOpen: jest.fn(),
      onAddAction: jest.fn(), // (action: DecodedAction) => void;
    };
  });

  it('Should match snapshot 1', () => {
    const { container } = render(<ActionsModal {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('Should match snapshot 2', () => {
    props.isOpen = true;
    jest
      .spyOn(React, 'useState')
      .mockReturnValueOnce([
        'GENERIC_CALL',
        () => console.log('setSelectedAction'),
      ]);
    const { container } = render(<ActionsModal {...props} />);
    expect(container).toMatchSnapshot();
  });

  //   it('Should select erc20 transfer', () => {
  //     props.isOpen = true;
  //     const setAction = () => jest.fn();

  //     jest
  //       .spyOn(React, 'useState')
  //       .mockReturnValueOnce(['GENERIC_CALL', setAction]);

  //     render(<ActionsModal {...props} />);
  //     expect(
  //       screen.getByTestId('actions-modal-contract-list')
  //     ).toBeInTheDocument();
  //     // fireEvent.click(screen.getByTestId('supported-action-erc20transfer'));
  //     // expect(setAction).toHaveBeenCalled();
  //     // expect(screen.queryByTestId('actions-modal-editor')).toBeInTheDocument();
  //   });
});
