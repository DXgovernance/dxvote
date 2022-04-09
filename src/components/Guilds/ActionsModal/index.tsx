import { utils } from 'ethers';
import { RegistryContract } from 'hooks/Guilds/contracts/useContractRegistry';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  defaultValues,
  getEditor,
  supportedActions,
} from '../ActionsBuilder/SupportedActions';
import {
  DecodedAction,
  DecodedCall,
  SupportedAction,
} from '../ActionsBuilder/types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import ContractActionsList from './ContractActionsList';
import ContractsList from './ContractsList';
import ParamsModal from './ParamsModal';

export const EditorWrapper = styled.div`
  margin: 1.25rem;
`;

export const BlockButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
`;

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

  // Supported Actions
  const [selectedAction, setSelectedAction] = useState<SupportedAction>(null);
  const [selectedActionContract, setSelectedActionContract] =
    useState<utils.Interface>(null);

  // Generic calls
  const [selectedContract, setSelectedContract] =
    useState<RegistryContract>(null);
  const [selectedFunction, setSelectedFunction] = useState<string>(null);

  const [data, setData] = useState<DecodedCall>(null);

  function getHeader() {
    if (selectedFunction) {
      return selectedContract.functions.find(
        fn => fn.functionName === selectedFunction
      )?.title;
    }

    if (selectedContract) {
      return selectedContract?.title;
    }

    if (selectedAction) {
      return supportedActions[selectedAction].title;
    }

    return 'Add action';
  }

  function getContent() {
    if (selectedFunction) {
      return (
        <ParamsModal
          fn={selectedContract.functions.find(
            fn => fn.functionName === selectedFunction
          )}
        />
      );
    }

    if (selectedContract) {
      return (
        <ContractActionsList
          contract={selectedContract}
          onSelect={setSelectedFunction}
        />
      );
    }

    if (selectedAction) {
      const Editor = getEditor(selectedAction);
      return (
        <EditorWrapper>
          <Editor decodedCall={data} updateCall={setData} />
          <BlockButton onClick={saveSupportedAction}>Save Action</BlockButton>
        </EditorWrapper>
      );
    }

    return (
      <ContractsList
        onSelect={setSelectedContract}
        onSupportedActionSelect={setSupportedAction}
      />
    );
  }

  function goBack() {
    if (selectedFunction) {
      setSelectedFunction(null);
    } else if (selectedContract) {
      setSelectedContract(null);
    } else if (selectedAction) {
      setSelectedAction(null);
      setSelectedActionContract(null);
    }

    setData(null);
  }

  function setSupportedAction(action: SupportedAction) {
    const defaultDecodedAction = defaultValues[action] as DecodedAction;
    if (!defaultDecodedAction) return null;

    defaultDecodedAction.decodedCall.from = guildId;
    defaultDecodedAction.decodedCall.callType = action;
    setData(defaultDecodedAction.decodedCall);
    setSelectedAction(action);
    setSelectedActionContract(defaultDecodedAction.contract);
  }

  function saveSupportedAction() {
    if (!selectedAction || !data || !setSelectedActionContract) return;

    const decodedAction: DecodedAction = {
      decodedCall: data,
      contract: selectedActionContract,
    };

    onAddAction(decodedAction);
    setIsOpen(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={() => setIsOpen(false)}
      header={getHeader()}
      maxWidth={300}
      backnCross={!!selectedAction || !!selectedContract}
      prevContent={goBack}
    >
      {getContent()}
    </Modal>
  );
};

export default ActionModal;
