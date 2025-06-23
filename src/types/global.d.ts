import { MongooseCache } from '../lib/mongodb';

declare global {
  var mongoose: MongooseCache | undefined;
}
