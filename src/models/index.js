// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Doctor, Appointment } = initSchema(schema);

export {
  User,
  Doctor,
  Appointment
};