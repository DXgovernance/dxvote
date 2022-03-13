import ActionModal from 'components/Guilds/ActionsModal';
import DxdControllerModal from 'components/Guilds/ActionsModal/DXDController';
import MintReputationModal from 'components/Guilds/ActionsModal/MintRepModal';
import { Modal } from 'components/Guilds/common/Modal';
import { createContext, useContext, useMemo, useState } from 'react';

export enum ActionsModalView {
  Base,
  DxdaoController,
  MintRep,
}

const ActionsModalContext = createContext(null);

export const ActionsModalProvider = ({ children }) => {
  const [modalView, setModalView] = useState<ActionsModalView[]>([
    ActionsModalView.Base,
  ]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [transferBuilder, setTransferBuilder] = useState(false);

  // closes modal and resets the view
  const closeModal = () => {
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

    switch (modalView[modalView.length - 1]) {
      case ActionsModalView.MintRep:
        modalHeader = <div>Mint Reputation</div>;
        modalChildren = <MintReputationModal />;
        backnCross = true;
        prevContent = () => setModalView(content => content.slice(0, -1));
        break;

      case ActionsModalView.DxdaoController:
        modalHeader = <div>Dxdao Controller</div>;
        modalChildren = <DxdControllerModal />;
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
