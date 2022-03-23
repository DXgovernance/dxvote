import { RegistryContract } from 'hooks/Guilds/contracts/useContractRegistry';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { defaultValues } from '../ActionsBuilder/SupportedActions';
import { DecodedAction, SupportedAction } from '../ActionsBuilder/types';
import { Modal } from '../common/Modal';
import ContractActionsList from './ContractActionsList';
import ContractsList from './ContractsList';

interface ActionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddAction: (action: DecodedAction) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  setIsOpen,
  onAddAction,
}) => {
  const { guild_id: guildId } = useParams<{ guild_id?: string }>();

  const [selectedContract, setSelectedContract] =
    useState<RegistryContract>(null);
  const [selectedFunction, setSelectedFunction] = useState<string>(null);

  function getHeader() {
    if (selectedFunction) {
      return selectedContract.functions.find(
        fn => fn.functionName === selectedFunction
      )?.title;
    }

    if (selectedContract) {
      return selectedContract?.title;
    }

    return 'Add action';
  }

  function getContent() {
    if (selectedFunction) {
      return null;
    }

    if (selectedContract) {
      return (
        <ContractActionsList
          contract={selectedContract}
          onSelect={setSelectedFunction}
        />
      );
    }

    return (
      <ContractsList
        onSelect={setSelectedContract}
        onSupportedActionSelect={addSupportedAction}
      />
    );
  }

  function goBack() {
    if (selectedFunction) {
      setSelectedFunction(null);
    } else if (selectedContract) {
      setSelectedContract(null);
    }
  }

  function addSupportedAction(action: SupportedAction) {
    const defaultDecodedAction = defaultValues[action];
    if (!defaultDecodedAction) return null;

    defaultDecodedAction.decodedCall.from = guildId;
    defaultDecodedAction.decodedCall.callType = action;
    onAddAction(defaultDecodedAction as DecodedAction);
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={() => setIsOpen(false)}
      header={getHeader()}
      maxWidth={300}
      backnCross={!!selectedContract}
      prevContent={goBack}
    >
      {getContent()}
    </Modal>
  );
};

export default ActionModal;
