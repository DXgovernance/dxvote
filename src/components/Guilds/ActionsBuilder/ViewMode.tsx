import { Option } from './types';
import { Divider } from '../common/Divider';
import OptionViewMode from './Option/ViewMode';

interface ViewModeProps {
  options: Option[];
}

const ViewMode: React.FC<ViewModeProps> = ({ options }) => {
  return (
    <>
      {options.map((option, idx) => (
        <>
          <OptionViewMode key={idx} data={option} />
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}
    </>
  );
};

export default ViewMode;
