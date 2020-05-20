import { all } from 'redux-saga/effects';
import { randomDogImagesSagas } from './randomDogImages';

export default function* rootSaga() {
  yield all([...randomDogImagesSagas]);
}
