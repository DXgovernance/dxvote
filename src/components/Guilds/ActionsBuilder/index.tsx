import styled from 'styled-components';
import { useState } from 'react';
import { Header as CardHeader } from '../common/Card';
import { Divider } from '../common/Divider';
import { Button as CommonButton } from '../common/Button';
import { Box } from '../common/Layout';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import OptionRow from './Option';
import AddButton from './common/AddButton';
import { BigNumber } from 'ethers';
import { DecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';

const Button = styled(CommonButton)`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.label};
  margin: 0;
  padding: 0.25rem 0.75rem;
`;

const AddOptionWrapper = styled(Box)`
  padding: 1rem;
`;

export interface Call {
  from: string;
  to: string;
  data: string;
  value: BigNumber;
}

export interface Option {
  index: number;
  label: string;
  actions?: Call[] | DecodedCall[];
}

interface ActionsBuilderProps {
  editable?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({ editable }) => {
  const [actionsEditMode, setActionsEditMode] = useState(true);

  // TODO: remove when actions are implemented
  const [options, setOptions] = useState<Option[]>([
    {
      index: 0,
      label: 'For',
      actions: [
        // {
        //   from: '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef',
        //   to: '0x698dd4ddeeda3cca704dc4c2ae4942137edd99d5',
        //   data: '0xa9059cbb00000000000000000000000001349510117dc9081937794939552463f5616dfb00000000000000000000000000000000000000000000021e19e0c9bab2400000',
        //   value: BigNumber.from(0),
        // },
      ],
    },
    {
      index: 1,
      label: 'Against',
    },
  ]);

  // const [decodedOptions, setDecodedOptions] = useState<
  //   Record<number, DecodedCall[]>
  // >({
  //   0: [],
  // });

  function updateOption(index: number, option: Option) {
    setOptions(options.map((o, i) => (i === index ? option : o)));
  }

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
            onChange={updatedOption => updateOption(idx, updatedOption)}
          />
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}

      {editable && actionsEditMode && options.length < 2 && (
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
