import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { Box } from 'old-components/Guilds/common/Layout/Box';
import { Modal } from 'old-components/Guilds/common/Modal';
import { Button } from 'old-components/Guilds/common/Button';
import { Option } from './types';
import Input from 'old-components/Guilds/common/Form/Input';

interface AddEditOptionModalProps {
  onDismiss: () => void;
  editableOption?: Option;
  onChange: (options: Option[]) => void;
  options: Option[];
}

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.muted};
  &:disabled {
    color: inherit;
  }
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background: ${({ theme, color }) => color ?? theme.colors.muted};
`;

const AddEditOptionModal: React.FC<AddEditOptionModalProps> = ({
  editableOption,
  options,
  onDismiss,
  onChange,
}) => {
  const defaultLabel = editableOption?.label ?? '';
  const isEditable = !!editableOption;
  const [label, setLabel] = React.useState<string>(defaultLabel);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleConfirmSave = () => {
    isEditable
      ? editOption({ ...editableOption, label })
      : saveNewOption(label);
  };

  const saveNewOption = (label: string) => {
    const newOptions = [
      ...options,
      {
        id: `option-${options.length}-${label}`,
        label,
        color: theme?.colors?.votes?.[options.length],
        decodedActions: [],
      },
    ];
    onChange(newOptions);
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
      isOpen
      onDismiss={onDismiss}
      header={t(!!editableOption ? 'guilds.editOption' : 'guilds.addOption')}
      maxWidth={300}
    >
      <Box padding="1rem 2rem">
        <Box padding="0 0 1rem 0">
          <Input
            value={label}
            placeholder={t('guilds.optionLabel', {
              defaultValue: 'Delete Option',
            })}
            icon={<Dot color={theme?.colors?.votes?.[options.length]} />}
            onChange={e => setLabel(e.target.value)}
          />
        </Box>

        {!!editableOption && (
          <Box padding="0 0 1rem 0">
            <DeleteButton onClick={deleteOption} fullWidth variant="secondary">
              {t('guilds.deleteOption', { defaultValue: 'Delete Option' })}
            </DeleteButton>
          </Box>
        )}

        <Box>
          <Button
            disabled={defaultLabel === label}
            fullWidth
            onClick={handleConfirmSave}
          >
            {t('save', { defaultValue: 'Save' })}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEditOptionModal;
