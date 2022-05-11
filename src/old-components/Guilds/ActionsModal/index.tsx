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
import ApproveSpendTokens from './ApproveSpendTokens';
import ContractsList from './ContractsList';
import ParamsForm from './ParamsForm';
import { useWeb3React } from '@web3-react/core';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import { BigNumber, utils } from 'ethers';
import React, { useState } from 'react';
import styled from 'styled-components';
import { RichContractData } from 'hooks/Guilds/contracts/useRichContractRegistry';

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
  const { guildId } = useTypedParams();
  const { account: walletAddress } = useWeb3React();
  // Supported Actions
  const [selectedAction, setSelectedAction] = useState<SupportedAction>(null);
  const [selectedActionContract, setSelectedActionContract] =
    useState<utils.Interface>(null);

  // Generic calls
  const [selectedContract, setSelectedContract] =
    useState<RichContractData>(null);
  const [selectedFunction, setSelectedFunction] = useState<string>(null);

  const [data, setData] = useState<DecodedCall>(null);
  const [payableFnData, updatePayableFnData] = useState<any>(null);

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
      const contractInterface = selectedContract.contractInterface;
      const contractId = selectedContract.contractAddress;
      const fn = selectedContract.functions.find(
        fn => fn.functionName === selectedFunction
      );
      const isPayable: boolean = fn?.spendsTokens;
      // Return approval form if function is marked with spendsTokens=true
      if (isPayable && !payableFnData) {
        return <ApproveSpendTokens onConfirm={updatePayableFnData} />;
      }

      return (
        <ParamsForm
          fn={fn}
          onSubmit={args => {
            onAddAction({
              id: `action-${Math.random()}`,
              contract: contractInterface,
              decodedCall: {
                callType: SupportedAction.GENERIC_CALL,
                from: guildId,
                to: contractId,
                function: contractInterface.getFunction(selectedFunction),
                value: BigNumber.from(0),
                args,
              },
              approval: payableFnData,
            });
            handleClose();
          }}
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
      updatePayableFnData(null);
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
    switch (action) {
      case SupportedAction.REP_MINT:
        defaultDecodedAction.decodedCall.args.to = walletAddress;
        break;
    }
    setData(defaultDecodedAction.decodedCall);
    setSelectedAction(action);
    setSelectedActionContract(defaultDecodedAction.contract);
  }

  function saveSupportedAction() {
    if (!selectedAction || !data || !setSelectedActionContract) return;

    const decodedAction: DecodedAction = {
      id: `action-${Math.random()}`,
      decodedCall: data,
      contract: selectedActionContract,
    };

    onAddAction(decodedAction);
    handleClose();
  }

  const handleClose = () => {
    setSelectedFunction(null);
    setSelectedContract(null);
    setSelectedAction(null);
    setSelectedActionContract(null);
    updatePayableFnData(null);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={handleClose}
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
