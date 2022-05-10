import styled from 'styled-components';
import { FiCode, FiArrowRight } from 'react-icons/fi';
import { ActionViewProps } from '..';
import useBigNumberToString from 'hooks/Guilds/conversions/useBigNumberToString';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import DataTag from '../../common/DataTag';
import { Segment } from '../common/infoLine';

const FunctionDetailsTag = styled(DataTag)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: ${({ theme }) => theme.fontSizes.label};
  line-height: ${({ theme }) => theme.lineHeights.body};
  padding: 0.125rem 0.375rem;
`;

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
  return (
    <>
      <Segment>
        <FiCode size={16} />
      </Segment>
      {compact && (
        <>
          <Segment>
            {approvalAmount} {tokenInfo?.symbol ?? ''}
          </Segment>
          <Segment>
            <FiArrowRight />
          </Segment>
        </>
      )}

      <Segment>{decodedCall?.function?.name}</Segment>
      {!compact && (
        <>
          <Segment>
            <FunctionDetailsTag>
              {decodedCall?.function?.name}(
              <>
                (
                {decodedCall?.function?.inputs.map((param, index, params) => (
                  <span key={index}>
                    {param?.type}
                    {index < params.length - 1 && <span> , </span>}
                  </span>
                ))}
                )
              </>
              )
            </FunctionDetailsTag>
          </Segment>
          <>
            {!!approveSpendTokens && (
              <Segment>
                <FunctionDetailsTag>
                  approve ({approvalAmount} {tokenInfo?.symbol ?? ''})
                </FunctionDetailsTag>
              </Segment>
            )}
          </>
        </>
      )}
    </>
  );
};

export default GenericCallInfoLine;
