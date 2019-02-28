import { combineReducers } from 'redux';
import { authentication } from './auth.reducer';
import { isProcessing } from './status.reducer';

const rootReducer = combineReducers({
    authentication,
    isProcessing
});

export default rootReducer;
