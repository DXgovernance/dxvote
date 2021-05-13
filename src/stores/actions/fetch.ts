export enum AsyncStatus {
    SUCCESS,
    STALE,
    TIMEOUT,
    FAILURE,
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
