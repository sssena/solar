import { statusConstants } from '../helpers/constants';

export const statusActions = {
    start,
    done
}

function start(){
    return { type: statusConstants.IS_PROCESSING }
}

function done() {
    return { type: statusConstants.IS_NOT_PROCESSING };
}
