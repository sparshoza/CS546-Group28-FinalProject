import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

//collections below 

export const users = getCollectionFn('users');
export const comments = getCollectionFn('comments');
export const groups = getCollectionFn('groups');
export const courses = getCollectionFn('courses');
export const reviews = getCollectionFn('reviews');