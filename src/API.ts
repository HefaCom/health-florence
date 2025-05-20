/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateUserInput = {
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string | null,
  role: string,
};

export type ModelUserConditionInput = {
  email?: ModelStringInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  phoneNumber?: ModelStringInput | null,
  dateOfBirth?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  zipCode?: ModelStringInput | null,
  emergencyContactName?: ModelStringInput | null,
  emergencyContactPhone?: ModelStringInput | null,
  allergies?: ModelStringInput | null,
  medicalConditions?: ModelStringInput | null,
  currentMedications?: ModelStringInput | null,
  role?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  owner?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type User = {
  __typename: "User",
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string | null,
  dateOfBirth?: string | null,
  address?: string | null,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  allergies?: string | null,
  medicalConditions?: string | null,
  currentMedications?: string | null,
  role: string,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateUserInput = {
  id: string,
  email?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  phoneNumber?: string | null,
  dateOfBirth?: string | null,
  address?: string | null,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null,
  emergencyContactName?: string | null,
  emergencyContactPhone?: string | null,
  allergies?: string | null,
  medicalConditions?: string | null,
  currentMedications?: string | null,
  role?: string | null,
};

export type DeleteUserInput = {
  id: string,
};

export type CreateDoctorInput = {
  id: string,
  userId: string,
  specialization: string,
  licenseNumber: string,
  yearsOfExperience: number,
};

export type ModelDoctorConditionInput = {
  userId?: ModelIDInput | null,
  specialization?: ModelStringInput | null,
  licenseNumber?: ModelStringInput | null,
  yearsOfExperience?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDoctorConditionInput | null > | null,
  or?: Array< ModelDoctorConditionInput | null > | null,
  not?: ModelDoctorConditionInput | null,
  owner?: ModelStringInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Doctor = {
  __typename: "Doctor",
  id: string,
  userId: string,
  specialization: string,
  licenseNumber: string,
  yearsOfExperience: number,
  user?: User | null,
  appointments?: ModelAppointmentConnection | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type ModelAppointmentConnection = {
  __typename: "ModelAppointmentConnection",
  items:  Array<Appointment | null >,
  nextToken?: string | null,
};

export type Appointment = {
  __typename: "Appointment",
  id: string,
  userId: string,
  doctorId: string,
  date: string,
  status: string,
  notes?: string | null,
  user?: User | null,
  doctor?: Doctor | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateDoctorInput = {
  id: string,
  userId?: string | null,
  specialization?: string | null,
  licenseNumber?: string | null,
  yearsOfExperience?: number | null,
};

export type DeleteDoctorInput = {
  id: string,
};

export type CreateAppointmentInput = {
  id: string,
  userId: string,
  doctorId: string,
  date: string,
  status: string,
  notes?: string | null,
};

export type ModelAppointmentConditionInput = {
  userId?: ModelIDInput | null,
  doctorId?: ModelIDInput | null,
  date?: ModelStringInput | null,
  status?: ModelStringInput | null,
  notes?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAppointmentConditionInput | null > | null,
  or?: Array< ModelAppointmentConditionInput | null > | null,
  not?: ModelAppointmentConditionInput | null,
  owner?: ModelStringInput | null,
};

export type UpdateAppointmentInput = {
  id: string,
  userId?: string | null,
  doctorId?: string | null,
  date?: string | null,
  status?: string | null,
  notes?: string | null,
};

export type DeleteAppointmentInput = {
  id: string,
};

export type CreateAuditEventInput = {
  id?: string | null,
  timestamp: string,
  userId: string,
  action: string,
  resourceId: string,
  details: string,
  transactionHash?: string | null,
  merkleRoot?: string | null,
  batchId?: string | null,
  auditBatchEventsId?: string | null,
};

export type ModelAuditEventConditionInput = {
  timestamp?: ModelStringInput | null,
  userId?: ModelStringInput | null,
  action?: ModelStringInput | null,
  resourceId?: ModelStringInput | null,
  details?: ModelStringInput | null,
  transactionHash?: ModelStringInput | null,
  merkleRoot?: ModelStringInput | null,
  batchId?: ModelStringInput | null,
  and?: Array< ModelAuditEventConditionInput | null > | null,
  or?: Array< ModelAuditEventConditionInput | null > | null,
  not?: ModelAuditEventConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  auditBatchEventsId?: ModelIDInput | null,
};

export type AuditEvent = {
  __typename: "AuditEvent",
  id: string,
  timestamp: string,
  userId: string,
  action: string,
  resourceId: string,
  details: string,
  transactionHash?: string | null,
  merkleRoot?: string | null,
  batchId?: string | null,
  createdAt: string,
  updatedAt: string,
  auditBatchEventsId?: string | null,
};

export type UpdateAuditEventInput = {
  id: string,
  timestamp?: string | null,
  userId?: string | null,
  action?: string | null,
  resourceId?: string | null,
  details?: string | null,
  transactionHash?: string | null,
  merkleRoot?: string | null,
  batchId?: string | null,
  auditBatchEventsId?: string | null,
};

export type DeleteAuditEventInput = {
  id: string,
};

export type CreateAuditBatchInput = {
  id?: string | null,
  timestamp: string,
  merkleRoot: string,
  transactionHash: string,
};

export type ModelAuditBatchConditionInput = {
  timestamp?: ModelStringInput | null,
  merkleRoot?: ModelStringInput | null,
  transactionHash?: ModelStringInput | null,
  and?: Array< ModelAuditBatchConditionInput | null > | null,
  or?: Array< ModelAuditBatchConditionInput | null > | null,
  not?: ModelAuditBatchConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type AuditBatch = {
  __typename: "AuditBatch",
  id: string,
  timestamp: string,
  merkleRoot: string,
  transactionHash: string,
  events?: ModelAuditEventConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelAuditEventConnection = {
  __typename: "ModelAuditEventConnection",
  items:  Array<AuditEvent | null >,
  nextToken?: string | null,
};

export type UpdateAuditBatchInput = {
  id: string,
  timestamp?: string | null,
  merkleRoot?: string | null,
  transactionHash?: string | null,
};

export type DeleteAuditBatchInput = {
  id: string,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  email?: ModelStringInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  phoneNumber?: ModelStringInput | null,
  dateOfBirth?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  zipCode?: ModelStringInput | null,
  emergencyContactName?: ModelStringInput | null,
  emergencyContactPhone?: ModelStringInput | null,
  allergies?: ModelStringInput | null,
  medicalConditions?: ModelStringInput | null,
  currentMedications?: ModelStringInput | null,
  role?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelDoctorFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelIDInput | null,
  specialization?: ModelStringInput | null,
  licenseNumber?: ModelStringInput | null,
  yearsOfExperience?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDoctorFilterInput | null > | null,
  or?: Array< ModelDoctorFilterInput | null > | null,
  not?: ModelDoctorFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelDoctorConnection = {
  __typename: "ModelDoctorConnection",
  items:  Array<Doctor | null >,
  nextToken?: string | null,
};

export type ModelAppointmentFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelIDInput | null,
  doctorId?: ModelIDInput | null,
  date?: ModelStringInput | null,
  status?: ModelStringInput | null,
  notes?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAppointmentFilterInput | null > | null,
  or?: Array< ModelAppointmentFilterInput | null > | null,
  not?: ModelAppointmentFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelAuditEventFilterInput = {
  id?: ModelIDInput | null,
  timestamp?: ModelStringInput | null,
  userId?: ModelStringInput | null,
  action?: ModelStringInput | null,
  resourceId?: ModelStringInput | null,
  details?: ModelStringInput | null,
  transactionHash?: ModelStringInput | null,
  merkleRoot?: ModelStringInput | null,
  batchId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAuditEventFilterInput | null > | null,
  or?: Array< ModelAuditEventFilterInput | null > | null,
  not?: ModelAuditEventFilterInput | null,
  auditBatchEventsId?: ModelIDInput | null,
};

export type ModelAuditBatchFilterInput = {
  id?: ModelIDInput | null,
  timestamp?: ModelStringInput | null,
  merkleRoot?: ModelStringInput | null,
  transactionHash?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAuditBatchFilterInput | null > | null,
  or?: Array< ModelAuditBatchFilterInput | null > | null,
  not?: ModelAuditBatchFilterInput | null,
};

export type ModelAuditBatchConnection = {
  __typename: "ModelAuditBatchConnection",
  items:  Array<AuditBatch | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  email?: ModelSubscriptionStringInput | null,
  firstName?: ModelSubscriptionStringInput | null,
  lastName?: ModelSubscriptionStringInput | null,
  phoneNumber?: ModelSubscriptionStringInput | null,
  dateOfBirth?: ModelSubscriptionStringInput | null,
  address?: ModelSubscriptionStringInput | null,
  city?: ModelSubscriptionStringInput | null,
  state?: ModelSubscriptionStringInput | null,
  zipCode?: ModelSubscriptionStringInput | null,
  emergencyContactName?: ModelSubscriptionStringInput | null,
  emergencyContactPhone?: ModelSubscriptionStringInput | null,
  allergies?: ModelSubscriptionStringInput | null,
  medicalConditions?: ModelSubscriptionStringInput | null,
  currentMedications?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionDoctorFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionIDInput | null,
  specialization?: ModelSubscriptionStringInput | null,
  licenseNumber?: ModelSubscriptionStringInput | null,
  yearsOfExperience?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDoctorFilterInput | null > | null,
  or?: Array< ModelSubscriptionDoctorFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionAppointmentFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionIDInput | null,
  doctorId?: ModelSubscriptionIDInput | null,
  date?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  notes?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAppointmentFilterInput | null > | null,
  or?: Array< ModelSubscriptionAppointmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionAuditEventFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  timestamp?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
  action?: ModelSubscriptionStringInput | null,
  resourceId?: ModelSubscriptionStringInput | null,
  details?: ModelSubscriptionStringInput | null,
  transactionHash?: ModelSubscriptionStringInput | null,
  merkleRoot?: ModelSubscriptionStringInput | null,
  batchId?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAuditEventFilterInput | null > | null,
  or?: Array< ModelSubscriptionAuditEventFilterInput | null > | null,
};

export type ModelSubscriptionAuditBatchFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  timestamp?: ModelSubscriptionStringInput | null,
  merkleRoot?: ModelSubscriptionStringInput | null,
  transactionHash?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAuditBatchFilterInput | null > | null,
  or?: Array< ModelSubscriptionAuditBatchFilterInput | null > | null,
  auditBatchEventsId?: ModelSubscriptionIDInput | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteUserMutationVariables = {
  input: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateDoctorMutationVariables = {
  input: CreateDoctorInput,
  condition?: ModelDoctorConditionInput | null,
};

export type CreateDoctorMutation = {
  createDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateDoctorMutationVariables = {
  input: UpdateDoctorInput,
  condition?: ModelDoctorConditionInput | null,
};

export type UpdateDoctorMutation = {
  updateDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteDoctorMutationVariables = {
  input: DeleteDoctorInput,
  condition?: ModelDoctorConditionInput | null,
};

export type DeleteDoctorMutation = {
  deleteDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateAppointmentMutationVariables = {
  input: CreateAppointmentInput,
  condition?: ModelAppointmentConditionInput | null,
};

export type CreateAppointmentMutation = {
  createAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateAppointmentMutationVariables = {
  input: UpdateAppointmentInput,
  condition?: ModelAppointmentConditionInput | null,
};

export type UpdateAppointmentMutation = {
  updateAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteAppointmentMutationVariables = {
  input: DeleteAppointmentInput,
  condition?: ModelAppointmentConditionInput | null,
};

export type DeleteAppointmentMutation = {
  deleteAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateAuditEventMutationVariables = {
  input: CreateAuditEventInput,
  condition?: ModelAuditEventConditionInput | null,
};

export type CreateAuditEventMutation = {
  createAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type UpdateAuditEventMutationVariables = {
  input: UpdateAuditEventInput,
  condition?: ModelAuditEventConditionInput | null,
};

export type UpdateAuditEventMutation = {
  updateAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type DeleteAuditEventMutationVariables = {
  input: DeleteAuditEventInput,
  condition?: ModelAuditEventConditionInput | null,
};

export type DeleteAuditEventMutation = {
  deleteAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type CreateAuditBatchMutationVariables = {
  input: CreateAuditBatchInput,
  condition?: ModelAuditBatchConditionInput | null,
};

export type CreateAuditBatchMutation = {
  createAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateAuditBatchMutationVariables = {
  input: UpdateAuditBatchInput,
  condition?: ModelAuditBatchConditionInput | null,
};

export type UpdateAuditBatchMutation = {
  updateAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteAuditBatchMutationVariables = {
  input: DeleteAuditBatchInput,
  condition?: ModelAuditBatchConditionInput | null,
};

export type DeleteAuditBatchMutation = {
  deleteAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDoctorQueryVariables = {
  id: string,
};

export type GetDoctorQuery = {
  getDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListDoctorsQueryVariables = {
  filter?: ModelDoctorFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDoctorsQuery = {
  listDoctors?:  {
    __typename: "ModelDoctorConnection",
    items:  Array< {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAppointmentQueryVariables = {
  id: string,
};

export type GetAppointmentQuery = {
  getAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListAppointmentsQueryVariables = {
  filter?: ModelAppointmentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAppointmentsQuery = {
  listAppointments?:  {
    __typename: "ModelAppointmentConnection",
    items:  Array< {
      __typename: "Appointment",
      id: string,
      userId: string,
      doctorId: string,
      date: string,
      status: string,
      notes?: string | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAuditEventQueryVariables = {
  id: string,
};

export type GetAuditEventQuery = {
  getAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type ListAuditEventsQueryVariables = {
  filter?: ModelAuditEventFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAuditEventsQuery = {
  listAuditEvents?:  {
    __typename: "ModelAuditEventConnection",
    items:  Array< {
      __typename: "AuditEvent",
      id: string,
      timestamp: string,
      userId: string,
      action: string,
      resourceId: string,
      details: string,
      transactionHash?: string | null,
      merkleRoot?: string | null,
      batchId?: string | null,
      createdAt: string,
      updatedAt: string,
      auditBatchEventsId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAuditBatchQueryVariables = {
  id: string,
};

export type GetAuditBatchQuery = {
  getAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListAuditBatchesQueryVariables = {
  filter?: ModelAuditBatchFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAuditBatchesQuery = {
  listAuditBatches?:  {
    __typename: "ModelAuditBatchConnection",
    items:  Array< {
      __typename: "AuditBatch",
      id: string,
      timestamp: string,
      merkleRoot: string,
      transactionHash: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string | null,
    dateOfBirth?: string | null,
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zipCode?: string | null,
    emergencyContactName?: string | null,
    emergencyContactPhone?: string | null,
    allergies?: string | null,
    medicalConditions?: string | null,
    currentMedications?: string | null,
    role: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateDoctorSubscriptionVariables = {
  filter?: ModelSubscriptionDoctorFilterInput | null,
};

export type OnCreateDoctorSubscription = {
  onCreateDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateDoctorSubscriptionVariables = {
  filter?: ModelSubscriptionDoctorFilterInput | null,
};

export type OnUpdateDoctorSubscription = {
  onUpdateDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteDoctorSubscriptionVariables = {
  filter?: ModelSubscriptionDoctorFilterInput | null,
};

export type OnDeleteDoctorSubscription = {
  onDeleteDoctor?:  {
    __typename: "Doctor",
    id: string,
    userId: string,
    specialization: string,
    licenseNumber: string,
    yearsOfExperience: number,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    appointments?:  {
      __typename: "ModelAppointmentConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateAppointmentSubscriptionVariables = {
  filter?: ModelSubscriptionAppointmentFilterInput | null,
  owner?: string | null,
};

export type OnCreateAppointmentSubscription = {
  onCreateAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateAppointmentSubscriptionVariables = {
  filter?: ModelSubscriptionAppointmentFilterInput | null,
  owner?: string | null,
};

export type OnUpdateAppointmentSubscription = {
  onUpdateAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteAppointmentSubscriptionVariables = {
  filter?: ModelSubscriptionAppointmentFilterInput | null,
  owner?: string | null,
};

export type OnDeleteAppointmentSubscription = {
  onDeleteAppointment?:  {
    __typename: "Appointment",
    id: string,
    userId: string,
    doctorId: string,
    date: string,
    status: string,
    notes?: string | null,
    user?:  {
      __typename: "User",
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      phoneNumber?: string | null,
      dateOfBirth?: string | null,
      address?: string | null,
      city?: string | null,
      state?: string | null,
      zipCode?: string | null,
      emergencyContactName?: string | null,
      emergencyContactPhone?: string | null,
      allergies?: string | null,
      medicalConditions?: string | null,
      currentMedications?: string | null,
      role: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    doctor?:  {
      __typename: "Doctor",
      id: string,
      userId: string,
      specialization: string,
      licenseNumber: string,
      yearsOfExperience: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateAuditEventSubscriptionVariables = {
  filter?: ModelSubscriptionAuditEventFilterInput | null,
};

export type OnCreateAuditEventSubscription = {
  onCreateAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type OnUpdateAuditEventSubscriptionVariables = {
  filter?: ModelSubscriptionAuditEventFilterInput | null,
};

export type OnUpdateAuditEventSubscription = {
  onUpdateAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type OnDeleteAuditEventSubscriptionVariables = {
  filter?: ModelSubscriptionAuditEventFilterInput | null,
};

export type OnDeleteAuditEventSubscription = {
  onDeleteAuditEvent?:  {
    __typename: "AuditEvent",
    id: string,
    timestamp: string,
    userId: string,
    action: string,
    resourceId: string,
    details: string,
    transactionHash?: string | null,
    merkleRoot?: string | null,
    batchId?: string | null,
    createdAt: string,
    updatedAt: string,
    auditBatchEventsId?: string | null,
  } | null,
};

export type OnCreateAuditBatchSubscriptionVariables = {
  filter?: ModelSubscriptionAuditBatchFilterInput | null,
};

export type OnCreateAuditBatchSubscription = {
  onCreateAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateAuditBatchSubscriptionVariables = {
  filter?: ModelSubscriptionAuditBatchFilterInput | null,
};

export type OnUpdateAuditBatchSubscription = {
  onUpdateAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteAuditBatchSubscriptionVariables = {
  filter?: ModelSubscriptionAuditBatchFilterInput | null,
};

export type OnDeleteAuditBatchSubscription = {
  onDeleteAuditBatch?:  {
    __typename: "AuditBatch",
    id: string,
    timestamp: string,
    merkleRoot: string,
    transactionHash: string,
    events?:  {
      __typename: "ModelAuditEventConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
