import { MongooseCache } from './mongodb';

declare global {
  var mongoose: MongooseCache | undefined;
}
