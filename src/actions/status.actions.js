import { statusConstants } from '../helpers/constants';

export const statusActions = {
    start,
    done,
    sendMessage
}

function start(){
    return { type: statusConstants.IS_PROCESSING }
}

function done() {
    return { type: statusConstants.IS_NOT_PROCESSING };
}

function sendMessage( message ) {
    return { type: statusConstants.SEND_MESSAGE, message: message };
}
