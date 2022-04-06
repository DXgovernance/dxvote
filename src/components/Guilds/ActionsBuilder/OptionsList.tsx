import styled, { useTheme } from 'styled-components';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  const theme = useTheme();
  function addOption() {
    onChange([
      ...options,
      {
        id: `option-${options.length}`,
        label: `Option ${options.length + 1}`,
        color: theme?.colors?.votes?.[options.length],
        decodedActions: [],
      },
    ]);
  }

  function updateOption(index: number, option: Option) {
    onChange(options.map((o, i) => (i === index ? option : o)));
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const items = [...options];
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={options} strategy={verticalListSortingStrategy}>
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
      </SortableContext>

      {isEditable && (
        <>
          <Divider />
          <AddOptionWrapper>
            <AddButton label="Add Option" onClick={addOption} />
          </AddOptionWrapper>
        </>
      )}
    </DndContext>
  );
};

export default OptionsList;
