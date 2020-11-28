import { Web3Errors } from '../../types';

const errorCodeMapping = {
    '4001': Web3Errors.SIGNATURE_REJECTED,
};

export const isKnownErrorCode = (code: number): boolean => {
    const codeStr = code.toString();
    return !!errorCodeMapping[codeStr];
};

export const getErrorByCode = (code: number): Web3Errors => {
    const codeStr = code.toString();
    if (isKnownErrorCode(code)) {
        return errorCodeMapping[codeStr];
    } else {
        return Web3Errors.UNKNOWN_ERROR;
    }
};
