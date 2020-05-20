import { combineReducers } from 'redux';
import { randomDogImagesReducers } from './randomDogImages';

export { default as rootSaga } from './rootSaga';

export const rootReducer = combineReducers({ ...randomDogImagesReducers });
