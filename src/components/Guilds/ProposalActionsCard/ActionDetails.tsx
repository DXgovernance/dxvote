import { FiExternalLink } from 'react-icons/fi';
import styled from 'styled-components';
import { Button, IconButton } from '../common/Button';
import { Box } from '../common/Layout';
import SidebarCard from '../SidebarCard';

const ActionTitle = styled(Box)`
  display: flex;
  padding: 1rem;
`;

const ActionParamTag = styled(Box)`
  border-radius: 0.5rem;
  padding: ${props => (props.detailed ? '0.3rem 1rem' : '0 0.5rem')};
  margin: 0 0.2rem;
  background-color: ${props => props.color};
  font-family: monospace;
`;

const ActionDetailsTable = styled.table`
  border: 0;
  font-family: monospace;
  margin: 1rem;
  border-collapse: separate;
  border-spacing: 0 1rem;
`;

const ActionDetailsRow = styled.tr`
  vertical-align: text-top;
`;

const ActionDetailsParam = styled.th`
  font-weight: 500;
`;

const ActionDetailsValue = styled.td`
  padding-left: 2rem;
  word-break: break-all;
  font-size: 0.9rem;
  font-weight: 600;

  button {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
  }
`;

const DecodeButton = styled(Button)`
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
`;

// to be replaced with theming array
const ActionParamColor = ['#F9DBDB', '#DBF9DF', '#DBECF9', '#F8DBF9'];

// fake Data to be replaced with contract params data
const contractParamTypes = ['address', 'bytes', 'address', 'uint256'];
const contractData = [
  '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
  '0x8efcc7500000000000000000000000006a023ccd1ff6f2045c3309768ead9e68f978f6e1000000000000000000000000b90d6bec20993be5d72a5ab353343f7a0281f1580000000000000000000000000000000000000000000000006d37db4d8e530000000000000000000000000000000000000000000000000001e5b8fa8fe2ac00000000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000000000000006194e23c0000000000000000000000000000000000000000000000000000000061bc6f3c0000000000000000000000005d48c95adffd4b40c1aaadc4e08fc44117e02179',
  '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
  '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
];

const contractParamNames = ['Contract', 'data', 'Avatar', 'Value'];

const repeatLoopThroughColorArray = (i: number, colorArray: String[]) =>
  i - colorArray.length * Math.floor(i / colorArray.length);

const ActionDetails = () => {
  return (
    <SidebarCard
      header={
        <ActionTitle>
          genericCall(
          {contractParamTypes.map((item, i) => {
            return (
              <>
                <ActionParamTag
                  color={
                    ActionParamColor[
                      repeatLoopThroughColorArray(i, ActionParamColor)
                    ]
                  }
                >
                  {item}
                </ActionParamTag>
              </>
            );
          })}
          )
        </ActionTitle>
      }
    >
      <ActionDetailsTable>
        {contractParamTypes.map((item, i) => {
          return (
            <ActionDetailsRow>
              <ActionDetailsParam>
                <ActionParamTag
                  color={
                    ActionParamColor[
                      repeatLoopThroughColorArray(i, ActionParamColor)
                    ]
                  }
                  detailed
                >
                  {contractParamNames[i]}
                  <br />
                  <em>({item})</em>
                </ActionParamTag>
                {item === 'bytes' ? <DecodeButton>Decode</DecodeButton> : null}
              </ActionDetailsParam>
              <ActionDetailsValue>
                {item === 'address' ? (
                  <IconButton variant="minimal" iconRight>
                    {contractData[i]}
                    <FiExternalLink />
                  </IconButton>
                ) : (
                  contractData[i]
                )}
              </ActionDetailsValue>
            </ActionDetailsRow>
          );
        })}
      </ActionDetailsTable>
    </SidebarCard>
  );
};

export default ActionDetails;
