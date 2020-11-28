import { TokenBalance, TotalSupply, UserAllowance } from '../Token';

export enum AsyncStatus {
    SUCCESS,
    STALE,
    TIMEOUT,
    FAILURE,
}

export interface TokenBalanceFetchRequest {
    tokenAddress: string;
    account: string;
    fetchBlock: number;
}

export class Fetch {
    status: AsyncStatus;
    request: any;
    payload: any;

    constructor({ status, request, payload }) {
        this.status = status;
        this.request = request;
        this.payload = payload;
    }
}

export class TokenBalanceFetch {
    status: AsyncStatus;
    request: TokenBalanceFetchRequest;
    payload: TokenBalance | undefined;

    constructor({ status, request, payload }) {
        this.status = status;
        this.request = request;
        this.payload = payload;
    }
}

export interface UserAllowanceFetchRequest {
    tokenAddress: string;
    owner: string;
    spender: string;
    fetchBlock: number;
}

export class UserAllowanceFetch {
    status: AsyncStatus;
    request: UserAllowanceFetchRequest;
    payload: UserAllowance | undefined;
    error?: string;

    constructor(params) {
        this.status = params.status;
        this.request = params.request;
        this.payload = params.payload;
        if (params.error) {
            this.error = params.error;
        }
    }
}

export interface TotalSupplyFetchRequest {
    tokenAddress: string;
    fetchBlock: number;
}

export class TotalSupplyFetch {
    status: AsyncStatus;
    request: TotalSupplyFetchRequest;
    payload: TotalSupply | undefined;
    error?: string;

    constructor(params) {
        this.status = params.status;
        this.request = params.request;
        this.payload = params.payload;
        if (params.error) {
            this.error = params.error;
        }
    }
}
