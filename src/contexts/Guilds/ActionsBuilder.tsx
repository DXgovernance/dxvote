import ActionModal from 'components/Guilds/ActionsModal';
import ExternalContractsModal from 'components/Guilds/ActionsModal/ExternalContractsModal';
import MintReputationModal from 'components/Guilds/ActionsModal/MintRepModal';
import { Modal } from 'components/Guilds/common/Modal';
import { createContext, useContext, useMemo, useState } from 'react';

export enum ActionsModalView {
  Base,
  ExternalContracts,
  MintRep,
}

const ActionsModalContext = createContext(null);

export const ActionsModalProvider = ({ children }) => {
  const [modalView, setModalView] = useState<ActionsModalView[]>([
    ActionsModalView.Base,
  ]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [transferBuilder, setTransferBuilder] = useState(false);
  const [mintRep, setMintRep] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showActionType, setShowActionType] = useState(false);
  // closes modal and resets the view
  const closeModal = () => {
    setMintRep(false);
    setModalView([ActionsModalView.Base]);
    setIsOpen(false);
  };

  const [
    modalHeader,
    modalChildren,
    confirmText,
    onConfirm,
    backnCross,
    prevContent,
  ] = useMemo(() => {
    let modalHeader: JSX.Element,
      modalChildren: JSX.Element,
      confirmText: string,
      onConfirm: () => void,
      backnCross: boolean,
      prevContent: () => void;

    const handleMintRep = () => {
      setMintRep(true);
      setIsOpen(false);
    };

    const fakeData = {
      noOfActions: 6,
      functionDescription: 'Mint Reputation',
      functionName: 'mintReputation(uint256, address, address)',
    };

    switch (modalView[modalView.length - 1]) {
      case ActionsModalView.MintRep:
        modalHeader = <div>Mint Reputation</div>;
        modalChildren = <MintReputationModal />;
        confirmText = 'Add Action';
        onConfirm = handleMintRep;
        backnCross = true;
        prevContent = () => setModalView(content => content.slice(0, -1));
        break;

      case ActionsModalView.ExternalContracts:
        modalHeader = <div>Dxdao Controller</div>;
        modalChildren = (
          <ExternalContractsModal
            functionDescription={fakeData.functionDescription}
            functionName={fakeData.functionName}
            noOfActions={fakeData.noOfActions}
          />
        );
        backnCross = true;
        prevContent = () => setModalView(content => content.slice(0, -1));
        break;

      default:
        modalHeader = <div>Mint Reputation</div>;
        modalChildren = <ActionModal />;
    }
    return [
      modalHeader,
      modalChildren,
      confirmText,
      onConfirm,
      backnCross,
      prevContent,
    ];
  }, [modalView]);

  return (
    <ActionsModalContext.Provider
      value={{
        modalView,
        setModalView,
        isOpen,
        setIsOpen,
        transferBuilder,
        setTransferBuilder,
        mintRep,
        setMintRep,
        actionType,
        setActionType,
        showActionType,
        setShowActionType,
      }}
    >
      {children}
      <Modal
        isOpen={isOpen}
        onDismiss={closeModal}
        header={modalHeader}
        maxWidth={300}
        children={modalChildren}
        confirmText={confirmText}
        onConfirm={onConfirm}
        backnCross={backnCross}
        prevContent={prevContent}
      />
    </ActionsModalContext.Provider>
  );
};

export const useActionsBuilder = () => useContext(ActionsModalContext);
