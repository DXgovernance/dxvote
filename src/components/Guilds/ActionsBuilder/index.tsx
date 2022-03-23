import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Header as CardHeader } from '../common/Card';
import { Button as CommonButton } from '../common/Button';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import EditMode from './EditMode';
import ViewMode from './ViewMode';
import { Option } from './types';
import { BigNumber } from 'ethers';
import { bulkDecodeCallsFromOptions } from 'hooks/Guilds/contracts/useDecodedCall';
import { useContractRegistry } from 'hooks/Guilds/contracts/useContractRegistry';
import { useWeb3React } from '@web3-react/core';

const Button = styled(CommonButton)`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.label};
  margin: 0;
  padding: 0.25rem 0.75rem;
`;

interface ActionsBuilderProps {
  editable?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({ editable }) => {
  const [actionsEditMode, setActionsEditMode] = useState(editable);

  // TODO: remove when actions are implemented
  const [options, setOptions] = useState<Option[]>([]);

  const { contracts } = useContractRegistry();
  const { chainId } = useWeb3React();
  useEffect(() => {
    // TODO: Get the calls from the contract
    const decodedOptions = bulkDecodeCallsFromOptions(
      [
        {
          index: 0,
          label: 'For',
          actions: [
            {
              from: '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef',
              to: '0x698dd4ddeeda3cca704dc4c2ae4942137edd99d5',
              data: '0xa9059cbb00000000000000000000000001349510117dc9081937794939552463f5616dfb00000000000000000000000000000000000000000000021e19e0c9bab2400000',
              value: BigNumber.from(0),
            },
          ],
        },
        {
          index: 1,
          label: 'Against',
        },
      ],
      contracts,
      chainId
    );

    setOptions(decodedOptions);
  }, [chainId, contracts]);

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          <Button
            variant="secondary"
            onClick={() => setActionsEditMode(!actionsEditMode)}
          >
            {actionsEditMode ? 'Save' : 'Edit'}
          </Button>
        </SidebarCardHeaderSpaced>
      }
    >
      {actionsEditMode ? (
        <EditMode options={options} onChange={setOptions} />
      ) : (
        <ViewMode options={options} />
      )}
    </SidebarCard>
  );
};
