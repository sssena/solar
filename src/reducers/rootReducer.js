import { combineReducers } from 'redux';
import { authentication } from './auth.reducer';
import { isProcessing } from './status.reducer';
import { isConnected } from './netStatus.reducer';
import { configure } from './configure.reducer';

const rootReducer = combineReducers({
    authentication,
    isProcessing,
    isConnected,
    configure
});

export default rootReducer;
