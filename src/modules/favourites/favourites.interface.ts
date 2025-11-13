
import { Model, ObjectId } from 'mongoose';

export interface IFavourites {
  user : ObjectId,
  gym : ObjectId
}