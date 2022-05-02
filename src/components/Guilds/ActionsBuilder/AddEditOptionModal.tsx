import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Box } from 'components/Guilds/common/Layout/Box';
import { Modal } from 'components/Guilds/common/Modal';
import { Button } from 'components/Guilds/common/Button';
import { Option } from './types';
import Input from 'components/Guilds/common/Form/Input';

interface AddEditOptionModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  editableOption: Option;
  onChange: (options: Option[]) => void;
  options: Option[];
}

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.muted};
  &:disabled {
    color: inherit;
  }
`;

const AddEditOptionModal: React.FC<AddEditOptionModalProps> = ({
  isOpen,
  editableOption,
  options,
  onDismiss,
  onChange,
}) => {
  const initialLabel = editableOption?.label ?? '';
  const isEditable = !!editableOption;
  const [label, setLabel] = React.useState<string>(initialLabel);
  const theme = useTheme();

  const handleConfirmSave = () => {
    isEditable
      ? editOption({ ...editableOption, label })
      : saveNewOption(label);
    setLabel(null);
  };

  const saveNewOption = (label: string) => {
    onChange([
      ...options,
      {
        id: `option-${options.length}-${label}`,
        label,
        color: theme?.colors?.votes?.[options.length],
        decodedActions: [],
      },
    ]);
    onDismiss();
  };

  const editOption = (option: Option) => {
    const newOptions = options.map(opt => {
      if (opt.id === option.id) {
        return {
          ...opt,
          label: option.label,
        };
      }
      return opt;
    });
    onChange(newOptions);
    onDismiss();
  };

  const deleteOption = () => {
    if (!isEditable) return;
    const newOptions = options.filter(opt => opt.id !== editableOption.id);
    onChange(newOptions);
    onDismiss();
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      header={!!editableOption ? 'Edit Option' : 'Add Option'}
      maxWidth={300}
    >
      <Box padding="1rem 2rem">
        <Box padding="0 0 1rem 0">
          <Input
            value={label}
            placeholder="Option Label"
            defaultValue={!!editableOption ? initialLabel : null}
            icon={
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: theme?.colors?.votes?.[options.length],
                }}
              ></div>
            }
            onChange={e => setLabel(e.target.value)}
          />
        </Box>

        {!!editableOption && (
          <Box padding="0 0 1rem 0">
            <DeleteButton
              disabled={!label}
              onClick={deleteOption}
              fullWidth
              variant="secondary"
            >
              Delete Option
            </DeleteButton>
          </Box>
        )}

        <Box>
          <Button fullWidth onClick={handleConfirmSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEditOptionModal;
