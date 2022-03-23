import { RegistryContract } from 'hooks/Guilds/contracts/useContractRegistry';
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import ContractActionsList from './ContractActionsList';
import ContractsList from './ContractsList';

interface ActionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, setIsOpen }) => {
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

    return <ContractsList onSelect={setSelectedContract} />;
  }

  function goBack() {
    if (selectedFunction) {
      setSelectedFunction(null);
    } else if (selectedContract) {
      setSelectedContract(null);
    }
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
