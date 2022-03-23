import styled from 'styled-components';
import { Divider } from '../common/Divider';
import { Box } from '../common/Layout';
import OptionEditMode from './Option/EditMode';
import AddButton from './common/AddButton';
import { Option } from './types';

const AddOptionWrapper = styled(Box)`
  padding: 1rem;
`;
interface EditModeProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

const EditMode: React.FC<EditModeProps> = ({ options, onChange }) => {
  function updateOption(index: number, option: Option) {
    onChange(options.map((o, i) => (i === index ? option : o)));
  }

  return (
    <>
      {options.map((option, idx) => (
        <>
          <OptionEditMode
            key={idx}
            option={option}
            onChange={updatedOption => updateOption(idx, updatedOption)}
          />
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}

      <Divider />
      <AddOptionWrapper>
        <AddButton label="Add Option" onClick={() => {}} />
      </AddOptionWrapper>
    </>
  );
};

export default EditMode;
