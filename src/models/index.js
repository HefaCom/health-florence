// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Expert, Appointment, ExpertPatient, PatientRecord, AuditEvent, AuditBatch, DietaryPlan, HealthGoal, HealthCondition, HAICReward } = initSchema(schema);

export {
  User,
  Expert,
  Appointment,
  ExpertPatient,
  PatientRecord,
  AuditEvent,
  AuditBatch,
  DietaryPlan,
  HealthGoal,
  HealthCondition,
  HAICReward
};