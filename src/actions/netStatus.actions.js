import { netStatusConstants } from '../helpers/constants';

export const netStatusActions = {
    connected,
    disconnected
}

function connected() {
    return { type: netStatusConstants.IS_CONNECTED };
}

function disconnected() {
    return { type: netStatusConstants.IS_DISCONNECTED };
}
