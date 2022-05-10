import { renderHook } from '@testing-library/react-hooks';
import { SupportedAction } from 'components/Guilds/ActionsBuilder/types';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS, ZERO_HASH } from 'utils';
import { useDecodedCall } from './useDecodedCall';

const mockChainId = 1337;
const contractAddress = '0x0000000000000000000000000000000000000001';
const erc20TransferData =
  '0xa9059cbb000000000000000000000000f960cec172d9ea3c0233d1caaceace4b597cbccf0000000000000000000000000000000000000000000000000000000077359400';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    chainId: mockChainId,
  }),
}));

jest.mock('./useRichContractData', () => ({
  useRichContractData: () => ({
    contracts: [],
  }),
}));

describe('useDecodedCall', () => {
  it('should return the decoded call', async () => {
    const { result } = renderHook(() =>
      useDecodedCall({
        data: erc20TransferData,
        from: ZERO_ADDRESS,
        to: contractAddress,
        value: BigNumber.from(0),
      })
    );

    expect(result.current.decodedCall).not.toBe(null);
    expect(result.current.contract).not.toBe(null);

    expect(result.current.decodedCall.from).toEqual(ZERO_ADDRESS);
    expect(result.current.decodedCall.to).toEqual(contractAddress);
    expect(result.current.decodedCall.value).toEqual(BigNumber.from(0));
    expect(result.current.decodedCall.callType).toEqual(
      SupportedAction.ERC20_TRANSFER
    );
    expect(result.current.decodedCall.function).not.toBe(null);
    expect(result.current.decodedCall.function.name).toBe('transfer');
  });

  it('Should return null when no call is available', () => {
    const { result } = renderHook(() => useDecodedCall(null));

    expect(result.current.decodedCall).toBe(null);
    expect(result.current.contract).toBe(null);
  });

  it('Should return null if unable to decode a call', () => {
    const { result } = renderHook(() =>
      useDecodedCall({
        data: ZERO_HASH,
        from: ZERO_ADDRESS,
        to: ZERO_ADDRESS,
        value: BigNumber.from(0),
      })
    );

    expect(result.current.decodedCall).toBe(null);
    expect(result.current.contract).toBe(null);
  });
});
