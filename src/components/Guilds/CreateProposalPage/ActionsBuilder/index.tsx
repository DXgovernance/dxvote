import styled from 'styled-components';
import { useState } from 'react';
import { Header as CardHeader } from '../../common/Card';
import { Divider } from '../../common/Divider';
import { Button as CommonButton } from '../../common/Button';
import { Box } from '../../common/Layout';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import OptionRow, { Option } from './Option';
import AddButton from './AddButton';
import TransferAndMint from './TransfersAndMint';
import { useActionsBuilder } from 'contexts/Guilds/ActionsBuilder';

const Button = styled(CommonButton)`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.label};
  margin: 0;
  padding: 0.25rem 0.75rem;
`;

const AddOptionWrapper = styled(Box)`
  padding: 1rem;
`;

interface ActionsBuilderProps {
  editable?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({ editable }) => {
  const [actionsEditMode, setActionsEditMode] = useState(true);

  const { transferBuilder } = useActionsBuilder();

  // TODO: remove when actions are implemented
  const [options, setOptions] = useState<Option[]>([
    {
      index: 0,
      label: 'For',
      actions: [
        {
          decodeText: 'Mint 0.16% REP',
          from: '0x0000000000000000000000000000000000000000',
          to: '0x95a223299319022a842d0dfe4851c145a2f615b9',
          functionName: 'genericCalls',
          params: [
            {
              name: 'Contract',
              type: 'address',
              value: '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
            },
            {
              name: 'data',
              type: 'bytes',
              value:
                '0x8efcc7500000000000000000000000006a023ccd1ff6f2045c3309768ead9e68f978f6e1000000000000000000000000b90d6bec20993be5d72a5ab353343f7a0281f1580000000000000000000000000000000000000000000000006d37db4d8e530000000000000000000000000000000000000000000000000001e5b8fa8fe2ac00000000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000000000000000000000000000000000006194e23c0000000000000000000000000000000000000000000000000000000061bc6f3c0000000000000000000000005d48c95adffd4b40c1aaadc4e08fc44117e02179',
            },
            {
              name: 'Avatar',
              type: 'address',
              value: '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
            },
            {
              name: 'value',
              type: 'uint256',
              value: '0xA369a0b81ee984a470EA0acf41EF9DdcDB5f7B46',
            },
          ],
        },
      ],
    },
    {
      index: 1,
      label: 'Against',
    },
  ]);

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          {editable &&
            (actionsEditMode ? (
              <Button
                variant="secondary"
                onClick={() => setActionsEditMode(false)}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setActionsEditMode(true)}
              >
                Edit
              </Button>
            ))}
        </SidebarCardHeaderSpaced>
      }
    >
      {options.map((option, idx) => (
        <>
          <OptionRow
            key={idx}
            data={option}
            editable={editable && actionsEditMode}
          />
          {transferBuilder && editable && option.label === 'For' && (
            <TransferAndMint />
          )}
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}

      {editable && actionsEditMode && (
        <>
          <Divider />
          <AddOptionWrapper>
            <AddButton
              label="Add Option"
              onClick={() => {
                // TODO: remove this random functionality when building "add option" funcionality
                setOptions(prev => [
                  ...prev,
                  {
                    index: prev.length + 1,
                    label: 'Option ' + (prev.length + 1),
                  },
                ]);
              }}
            />
          </AddOptionWrapper>
        </>
      )}
    </SidebarCard>
  );
};
