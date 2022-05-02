import styled from 'styled-components';
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  getFirstCollision,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Divider } from '../common/Divider';
import { Box } from '../common/Layout';
import OptionRow from './Option';
import AddButton from './common/AddButton';
import { DecodedAction, Option } from './types';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';

const AddOptionWrapper = styled(Box)`
  padding: 1rem;
`;

interface OptionsListProps {
  isEditable: boolean;
  options: Option[];
  onChange: (options: Option[]) => void;
  addOption: () => void;
  editOption: (option: Option) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({
  isEditable,
  options,
  onChange,
  addOption,
  editOption,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const [clonedOptions, setClonedOptions] = useState<Option[]>(null);
  const recentlyMovedToNewContainer = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [options]);

  // const theme = useTheme();
  // function addOption() {
  //   onChange([
  //     ...options,
  //     {
  //       id: `option-${options.length}`,
  //       label: `Option ${options.length + 1}`,
  //       color: theme?.colors?.votes?.[options.length],
  //       decodedActions: [],
  //     },
  //   ]);
  // }

  function updateOption(index: number, option: Option) {
    onChange(options.map((o, i) => (i === index ? option : o)));
  }

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const findContainer = (id: string) => {
    if (options.find(option => option.id === id)) {
      return id;
    }

    return options
      .map(option => ({
        id: option.id,
        keys: option.decodedActions.map(action => action.id),
      }))
      .find(keyMap => keyMap.keys.includes(id))?.id;
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    setClonedOptions(options);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    const overId = over?.id;

    if (!overId || options.find(option => option.id === active.id)) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    // When dragging an action between options, move the action over to the new option
    if (activeContainer !== overContainer) {
      const activeOption = options.find(
        option => option.id === activeContainer
      );
      const overOption = options.find(option => option.id === overContainer);
      const activeActions = activeOption.decodedActions;
      const overActions = overOption.decodedActions;
      const overIndex = overActions.findIndex(item => item.id === overId);
      const activeIndex = activeActions.findIndex(
        item => item.id === active.id
      );

      let newIndex: number;

      if (options.find(option => option.id === overId)) {
        newIndex = overActions.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex =
          overIndex >= 0 ? overIndex + modifier : overActions.length + 1;
      }

      recentlyMovedToNewContainer.current = true;

      let activeAction: DecodedAction;
      const updatedOptions = options
        .map(option => {
          if (option.id === activeContainer) {
            activeAction = option.decodedActions[activeIndex];
            option.decodedActions = option.decodedActions.filter(
              action => action.id !== active.id
            );
          }
          return option;
        })
        .map(option => {
          if (option.id === overContainer) {
            const decodedActions = option.decodedActions;
            option.decodedActions = [
              ...decodedActions.slice(0, newIndex),
              activeAction,
              ...decodedActions.slice(newIndex),
            ];
          }
          return option;
        });
      onChange(updatedOptions);
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    // Reorder options
    if (options.find(option => option.id === active.id) && over?.id) {
      const items = [...options];
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }

    const activeContainer = findContainer(active.id);
    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overContainer = over?.id ? findContainer(over?.id) : null;
    if (!overContainer) {
      setActiveId(null);
      return;
    }

    // Reorder actions
    if (overContainer) {
      const activeIndex = options
        .find(option => option.id === activeContainer)
        .decodedActions.findIndex(item => item.id === active.id);
      const overIndex = options
        .find(option => option.id === overContainer)
        .decodedActions.findIndex(item => item.id === over.id);

      if (activeIndex !== overIndex) {
        const newOptions = options.map(option => {
          if (option.id === overContainer) {
            option.decodedActions = arrayMove(
              option.decodedActions,
              activeIndex,
              overIndex
            );
          }
          return option;
        });

        onChange(newOptions);
      }
    }

    setActiveId(null);
  }

  const handleDragCancel = () => {
    if (clonedOptions) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      onChange(clonedOptions);
    }

    setActiveId(null);
    setClonedOptions(null);
  };

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    args => {
      // --- Collision detection when dragging Options
      if (activeId && options.find(option => option.id === activeId)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container =>
            options.find(option => option.id === container.id)
          ),
        });
      }

      // --- Collision detection when dragging Actions

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const overOption = options.find(option => option.id === overId);
        if (overOption) {
          const overOptionActions = overOption.decodedActions;

          // If a container is matched and it contains Actions
          if (overOptionActions.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container =>
                  container.id !== overId &&
                  overOptionActions.find(action => action.id === container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, options]
  );

  return (
    <DndContext
      sensors={sensors}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {options && (
        <SortableContext items={options} strategy={verticalListSortingStrategy}>
          {options?.map((option, idx) => (
            <>
              <OptionRow
                key={idx}
                option={option}
                onChange={updatedOption => updateOption(idx, updatedOption)}
                isEditable={isEditable}
                editOption={editOption}
              />
              {idx !== options.length - 1 && <Divider />}
            </>
          ))}
        </SortableContext>
      )}

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
