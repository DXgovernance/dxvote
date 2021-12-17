import { Modal, ModalProps } from 'components/Modal';

const TransactionSubmittedContent: React.ReactElement = (
    <div>
        <div>Transaction Submitted</div>
        <div>View on Block Explorer</div>
    </div>
);

const TransactionRejectedContent: React.ReactElement = (
    <div>
        <div>Transaction Rejected</div>
        <div>View on Block Explorer</div>
    </div>
);
//@TODO: make dynamic
const WaitingForTransactionContent: React.ReactElement = (
    <div>
        <div>Waiting For Confirmation</div>
        <div>Stake 52.42DXD for 324 Days</div>
    </div>
);

type TransasctionModalProps = Pick<ModalProps, 'isOpen' | 'onDismiss'>

export const TransactionWait: React.FC<TransasctionModalProps> = ({ isOpen, onDismiss }) => {
    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            hideHeader
            children={WaitingForTransactionContent}
            cancelText="Close"
            header={<div>hi</div>}
        />
    );
};

export const TransactionSubmitted: React.FC<TransasctionModalProps> = ({ isOpen, onDismiss }) => {
    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            hideHeader
            children={TransactionSubmittedContent}
            cancelText="Dismiss"
            header={<div>hi</div>}
        />
    );
};

export const TransactionRejected: React.FC<TransasctionModalProps> = ({ isOpen, onDismiss }) => {
    return (
        <Modal
            hideHeader
            children={TransactionRejectedContent}
            isOpen={isOpen}
            onDismiss={onDismiss}
            header={<div>hi</div>}
        />
    );
};
