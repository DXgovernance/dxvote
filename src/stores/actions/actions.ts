import { Contract } from 'ethers';
import { TXEvents } from '../../types';
import { getErrorByCode, isKnownErrorCode } from './error';
import PromiEvent from 'promievent';

interface ActionRequest {
    contract: Contract;
    action: string;
    sender: string;
    data: any[];
    overrides: any;
}

export interface ActionResponse {
    contract: Contract;
    action: string;
    sender: string;
    data: object;
    txResponse: any | undefined;
    error: any | undefined;
}

const preLog = (params: ActionRequest) => {
    console.debug(`[@action start: ${params.action}]`, {
        contract: params.contract,
        action: params.action,
        sender: params.sender,
        data: params.data,
        overrides: params.overrides,
    });
};

export const sendAction = (params: ActionRequest): PromiEvent<any> => {
    const { contract, action, sender, data, overrides } = params;
    preLog(params);

    const promiEvent = new PromiEvent<any>(() => {
        contract.methods[action](...data)
            .send({ from: sender, ...overrides })
            .once('transactionHash', (hash) => {
                promiEvent.emit(TXEvents.TX_HASH, hash);
                console.debug(TXEvents.TX_HASH, hash);
            })
            .once('receipt', (receipt) => {
                promiEvent.emit(TXEvents.RECEIPT, receipt);
                console.debug(TXEvents.RECEIPT, receipt);
            })
            .once('confirmation', (confNumber, receipt) => {
                promiEvent.emit(TXEvents.CONFIRMATION, {
                    confNumber,
                    receipt,
                });
                console.debug(TXEvents.CONFIRMATION, {
                    confNumber,
                    receipt,
                });
            })
            .on('error', (error) => {
                console.debug(error.code);
                if (error.code && isKnownErrorCode(error.code)) {
                    promiEvent.emit(
                        TXEvents.TX_ERROR,
                        getErrorByCode(error.code)
                    );
                    console.debug(TXEvents.TX_ERROR, getErrorByCode(error.code));
                } else {
                    promiEvent.emit(TXEvents.INVARIANT, error);
                    console.debug(TXEvents.INVARIANT, error);
                }
            })
            .then((receipt) => {
                promiEvent.emit(TXEvents.FINALLY, receipt);
                console.debug(TXEvents.FINALLY, receipt);
            })
            .catch((e) => {
                console.debug('rejected', e);
            });
    });

    return promiEvent;
};
