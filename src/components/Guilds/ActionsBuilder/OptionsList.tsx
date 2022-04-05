import styled from 'styled-components';
import { Divider } from '../common/Divider';
import { Box } from '../common/Layout';
import OptionRow from './Option';
import AddButton from './common/AddButton';
import { Option } from './types';

const AddOptionWrapper = styled(Box)`
  padding: 1rem;
`;
interface OptionsListProps {
  isEditable: boolean;
  options: Option[];
  onChange: (options: Option[]) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({
  isEditable,
  options,
  onChange,
}) => {
  function addOption() {
    onChange([
      ...options,
      {
        index: options.length,
        label: `Option ${options.length + 1}`,
        decodedActions: [],
      },
    ]);
  }

  function updateOption(index: number, option: Option) {
    onChange(options.map((o, i) => (i === index ? option : o)));
  }

  return (
    <>
      {options?.map((option, idx) => (
        <>
          <OptionRow
            key={idx}
            option={option}
            onChange={updatedOption => updateOption(idx, updatedOption)}
            isEditable={isEditable}
          />
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}

      {isEditable && (
        <>
          <Divider />
          <AddOptionWrapper>
            <AddButton label="Add Option" onClick={addOption} />
          </AddOptionWrapper>
        </>
      )}
    </>
  );
};

export default OptionsList;
