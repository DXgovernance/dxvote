import { DecodedAction } from 'old-components/Guilds/ActionsBuilder/types';

export interface ActionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddAction: (action: DecodedAction) => void;
}
