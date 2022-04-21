import styled from 'styled-components';
import { FiCode } from 'react-icons/fi';
import { ActionViewProps } from '..';
import DataTag from '../../common/DataTag';
import { Segment } from '../common/infoLine';

const FunctionDetailsTag = styled(DataTag)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: ${({ theme }) => theme.fontSizes.label};
  line-height: ${({ theme }) => theme.lineHeights.body};
  padding: 0.125rem 0.375rem;
`;

const GenericCallInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  return (
    <>
      <Segment>
        <FiCode size={16} />
      </Segment>
      <Segment>{decodedCall?.function?.name}</Segment>
      <Segment>
        <FunctionDetailsTag>
          {decodedCall?.function?.name} (
          {decodedCall?.function?.inputs.map((param, index, params) => (
            <span key={index}>
              {param?.type}
              {index < params.length - 1 && <span> , </span>}
            </span>
          ))}
          )
        </FunctionDetailsTag>
      </Segment>
    </>
  );
};

export default GenericCallInfoLine;
