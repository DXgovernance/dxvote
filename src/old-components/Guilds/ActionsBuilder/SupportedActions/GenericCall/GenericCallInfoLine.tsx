// import styled from 'styled-components';
import { FiCode, FiArrowRight } from 'react-icons/fi';
import { Interweave } from 'interweave';
import { ActionViewProps } from '..';
import useBigNumberToString from 'hooks/Guilds/conversions/useBigNumberToString';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { Segment } from '../common/infoLine';
import useRichContractData from 'hooks/Guilds/contracts/useRichContractData';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { RichContractFunctionParam } from 'hooks/Guilds/contracts/useRichContractRegistry';
import GenericCallParamsMatcher from './GenericCallParamsMatcher';

export interface FunctionParamWithValue extends RichContractFunctionParam {
  value: string;
}

const GenericCallInfoLine: React.FC<ActionViewProps> = ({
  decodedCall,
  approveSpendTokens,
  compact = false,
}) => {
  const { data: tokenInfo } = useERC20Info(approveSpendTokens?.token);
  const approvalAmount = useBigNumberToString(
    approveSpendTokens?.amount,
    tokenInfo?.decimals
  );
  const { functionData } = useRichContractData(decodedCall);

  function getStringForParam(type: string, value: any) {
    if (!type || !value) return null;

    if (type.startsWith('uint') || type.startsWith('int')) {
      return BigNumber.from(value).toString();
    }

    return value;
  }

  const params: FunctionParamWithValue[] = useMemo(() => {
    if (!functionData?.templateLiteral || !decodedCall) return null;

    return functionData.params.map(param => ({
      ...param,
      value: getStringForParam(param.type, decodedCall.args[param.name]),
    }));
  }, [functionData, decodedCall]);

  return (
    <>
      <Segment>
        <FiCode size={16} />
      </Segment>

      <>
        {!!approveSpendTokens && (
          <>
            <Segment>
              {approvalAmount} {tokenInfo?.symbol ?? ''}
            </Segment>
            <Segment>
              <FiArrowRight />
            </Segment>
          </>
        )}
      </>
      {compact || !params ? (
        <Segment>{decodedCall?.function?.name}</Segment>
      ) : (
        <>
          <Segment>
            <Interweave
              content={functionData?.templateLiteral}
              matchers={[
                new GenericCallParamsMatcher('genericCallParamsMatcher', {
                  params,
                }),
              ]}
            />
          </Segment>
        </>
      )}
    </>
  );
};

export default GenericCallInfoLine;
