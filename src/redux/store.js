import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './reducers/templateSlice';
import skewReducer from './reducers/skewSlice';
import tempControlReducer from './reducers/tempControlSlice';
import boxReducer from './reducers/boxSlice';
import userDataReducer from "./reducers/UserManagementSlice"
import testReducer from "./reducers/testSlice"

export const store = configureStore({
  reducer: {
    templates: templateReducer,
    skew: skewReducer,
    tempControl: tempControlReducer,
    BoxData: boxReducer,
    UserData: userDataReducer,
    tests: testReducer,
  },
});