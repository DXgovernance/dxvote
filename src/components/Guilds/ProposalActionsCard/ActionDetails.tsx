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
  background-color: #f9dbdb;
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

const ActionDetails = () => {
  return (
    <SidebarCard
      header={
        <ActionTitle>
          genericCall(<ActionParamTag>address</ActionParamTag>,
          <ActionParamTag>bytes</ActionParamTag>,
          <ActionParamTag>address</ActionParamTag>,
          <ActionParamTag>uint256</ActionParamTag>)
        </ActionTitle>
      }
    >
      <ActionDetailsTable>
        <ActionDetailsRow>
          <ActionDetailsParam>
            <ActionParamTag detailed>
              Contract
              <br />
              <em>(address)</em>
            </ActionParamTag>
          </ActionDetailsParam>
          <ActionDetailsValue>
            <IconButton variant="minimal" iconRight>
              0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46
              <FiExternalLink />
            </IconButton>
          </ActionDetailsValue>
        </ActionDetailsRow>

        <ActionDetailsRow>
          <ActionDetailsParam>
            <ActionParamTag detailed>
              Data
              <br />
              <em>(bytes)</em>
            </ActionParamTag>

            <DecodeButton>Decode</DecodeButton>
          </ActionDetailsParam>
          <ActionDetailsValue>
            0x8efcc7500000000000000000000000006a023ccd1ff6f2045c3309768ead9e68f978f6e1000000000000000000000000b90d6bec20993be5d72a5ab353343f7a0281f1580000000000000000000000000000000000000000000000006d37db4d8e530000000000000000000000000000000000000000000000000001e5b8fa8fe2ac00000000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000000000000006194e23c0000000000000000000000000000000000000000000000000000000061bc6f3c0000000000000000000000005d48c95adffd4b40c1aaadc4e08fc44117e02179
          </ActionDetailsValue>
        </ActionDetailsRow>

        <ActionDetailsRow>
          <ActionDetailsParam>
            <ActionParamTag detailed>
              Avatar
              <br />
              <em>(address)</em>
            </ActionParamTag>
          </ActionDetailsParam>
          <ActionDetailsValue>
            <IconButton variant="minimal" iconRight>
              0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46
              <FiExternalLink />
            </IconButton>
          </ActionDetailsValue>
        </ActionDetailsRow>

        <ActionDetailsRow>
          <ActionDetailsParam>
            <ActionParamTag detailed>
              Value
              <br />
              <em>(uint256)</em>
            </ActionParamTag>
          </ActionDetailsParam>
          <ActionDetailsValue>
            0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46
          </ActionDetailsValue>
        </ActionDetailsRow>
      </ActionDetailsTable>
    </SidebarCard>
  );
};

export default ActionDetails;
