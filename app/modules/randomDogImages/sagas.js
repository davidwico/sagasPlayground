import axios from 'axios';
import { takeEvery, call, put, delay, fork, take, cancel } from 'redux-saga/effects';
import { fetchRandomDogImageSuccess, fetchRandomDogImageFailure } from './actions';
import TYPES from './types';
import { fetchAPI } from '../../api';

const URL = 'https://dog.ceo/api/breeds/image/random';

// Broken URL for error handler testing
// const URL = 'https://dog.ceo/api/breeds/images/random';

// -- Basic fetch --
// function* fetchRandomDogImageSaga() {
//   const response = yield call(axios.get, URL);
//   yield put(fetchRandomDogImageSuccess(response.data));
// }

// -- Fetch with error handling --
// function* fetchRandomDogImageSaga() {
//   try {
//     const response = yield call(axios.get, URL);
//     yield put(fetchRandomDogImageSuccess(response.data));
//   } catch (e) {
//     yield put(fetchRandomDogImageFailure(e));
//   }
// }

// -- Fetch with cancellation and error handling (additional delay operator for testing request cancellation) --
// More about cancel axios requests: https://github.com/redux-saga/redux-saga/issues/651#issuecomment-262375964
// or https://github.com/axios/axios#cancellation
// function* fetchSaga(url) {
//   try {
//     const response = yield call(fetchAPI, url);
//     yield delay(2000);
//     yield put(fetchRandomDogImageSuccess(response.data));
//   } catch (e) {
//     yield put(fetchRandomDogImageFailure(e));
//   }
// }

// function* fetchRandomDogImageSaga() {
//   const fetchTask = yield fork(fetchSaga, URL);
//   const cancelAction = yield take(TYPES.FETCH_RANDOM_DOG_IMAGE_REQUESTED_CANCELLED);
//   if (cancelAction) {
//     yield cancel(fetchTask);
//   }
// }

// -- Fetch with cancellation, error handling and retry --
function* fetchSagaWithRetries(url, retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = yield call(fetchAPI, url);
      if (response) {
        yield delay(2000); // Remove this line (it's only for cancellation testing - to extend the request time)
        return yield put(fetchRandomDogImageSuccess(response.data));
      }
    } catch (e) {
      if (i < retries - 1) {
        yield delay(500); // Time to wait between request retries
      }
    }
  }
  yield put(fetchRandomDogImageFailure({ message: 'failed after 3 tries' }));
}

function* fetchRandomDogImageSaga() {
  const fetchTask = yield fork(fetchSagaWithRetries, URL, 3);
  const cancelAction = yield take(TYPES.FETCH_RANDOM_DOG_IMAGE_REQUESTED_CANCELLED);
  if (cancelAction) {
    yield cancel(fetchTask);
  }
}

export default [takeEvery(TYPES.FETCH_RANDOM_DOG_IMAGE_REQUESTED, fetchRandomDogImageSaga)];
