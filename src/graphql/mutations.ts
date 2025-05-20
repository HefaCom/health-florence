/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
    id
    email
    firstName
    lastName
    phoneNumber
    dateOfBirth
    address
    city
    state
    zipCode
    emergencyContactName
    emergencyContactPhone
    allergies
    medicalConditions
    currentMedications
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
    id
    email
    firstName
    lastName
    phoneNumber
    dateOfBirth
    address
    city
    state
    zipCode
    emergencyContactName
    emergencyContactPhone
    allergies
    medicalConditions
    currentMedications
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
    id
    email
    firstName
    lastName
    phoneNumber
    dateOfBirth
    address
    city
    state
    zipCode
    emergencyContactName
    emergencyContactPhone
    allergies
    medicalConditions
    currentMedications
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createDoctor = /* GraphQL */ `mutation CreateDoctor(
  $input: CreateDoctorInput!
  $condition: ModelDoctorConditionInput
) {
  createDoctor(input: $input, condition: $condition) {
    id
    userId
    specialization
    licenseNumber
    yearsOfExperience
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    appointments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDoctorMutationVariables,
  APITypes.CreateDoctorMutation
>;
export const updateDoctor = /* GraphQL */ `mutation UpdateDoctor(
  $input: UpdateDoctorInput!
  $condition: ModelDoctorConditionInput
) {
  updateDoctor(input: $input, condition: $condition) {
    id
    userId
    specialization
    licenseNumber
    yearsOfExperience
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    appointments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDoctorMutationVariables,
  APITypes.UpdateDoctorMutation
>;
export const deleteDoctor = /* GraphQL */ `mutation DeleteDoctor(
  $input: DeleteDoctorInput!
  $condition: ModelDoctorConditionInput
) {
  deleteDoctor(input: $input, condition: $condition) {
    id
    userId
    specialization
    licenseNumber
    yearsOfExperience
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    appointments {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDoctorMutationVariables,
  APITypes.DeleteDoctorMutation
>;
export const createAppointment = /* GraphQL */ `mutation CreateAppointment(
  $input: CreateAppointmentInput!
  $condition: ModelAppointmentConditionInput
) {
  createAppointment(input: $input, condition: $condition) {
    id
    userId
    doctorId
    date
    status
    notes
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    doctor {
      id
      userId
      specialization
      licenseNumber
      yearsOfExperience
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAppointmentMutationVariables,
  APITypes.CreateAppointmentMutation
>;
export const updateAppointment = /* GraphQL */ `mutation UpdateAppointment(
  $input: UpdateAppointmentInput!
  $condition: ModelAppointmentConditionInput
) {
  updateAppointment(input: $input, condition: $condition) {
    id
    userId
    doctorId
    date
    status
    notes
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    doctor {
      id
      userId
      specialization
      licenseNumber
      yearsOfExperience
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAppointmentMutationVariables,
  APITypes.UpdateAppointmentMutation
>;
export const deleteAppointment = /* GraphQL */ `mutation DeleteAppointment(
  $input: DeleteAppointmentInput!
  $condition: ModelAppointmentConditionInput
) {
  deleteAppointment(input: $input, condition: $condition) {
    id
    userId
    doctorId
    date
    status
    notes
    user {
      id
      email
      firstName
      lastName
      phoneNumber
      dateOfBirth
      address
      city
      state
      zipCode
      emergencyContactName
      emergencyContactPhone
      allergies
      medicalConditions
      currentMedications
      role
      createdAt
      updatedAt
      owner
      __typename
    }
    doctor {
      id
      userId
      specialization
      licenseNumber
      yearsOfExperience
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAppointmentMutationVariables,
  APITypes.DeleteAppointmentMutation
>;
export const createAuditEvent = /* GraphQL */ `mutation CreateAuditEvent(
  $input: CreateAuditEventInput!
  $condition: ModelAuditEventConditionInput
) {
  createAuditEvent(input: $input, condition: $condition) {
    id
    timestamp
    userId
    action
    resourceId
    details
    transactionHash
    merkleRoot
    batchId
    createdAt
    updatedAt
    auditBatchEventsId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAuditEventMutationVariables,
  APITypes.CreateAuditEventMutation
>;
export const updateAuditEvent = /* GraphQL */ `mutation UpdateAuditEvent(
  $input: UpdateAuditEventInput!
  $condition: ModelAuditEventConditionInput
) {
  updateAuditEvent(input: $input, condition: $condition) {
    id
    timestamp
    userId
    action
    resourceId
    details
    transactionHash
    merkleRoot
    batchId
    createdAt
    updatedAt
    auditBatchEventsId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAuditEventMutationVariables,
  APITypes.UpdateAuditEventMutation
>;
export const deleteAuditEvent = /* GraphQL */ `mutation DeleteAuditEvent(
  $input: DeleteAuditEventInput!
  $condition: ModelAuditEventConditionInput
) {
  deleteAuditEvent(input: $input, condition: $condition) {
    id
    timestamp
    userId
    action
    resourceId
    details
    transactionHash
    merkleRoot
    batchId
    createdAt
    updatedAt
    auditBatchEventsId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAuditEventMutationVariables,
  APITypes.DeleteAuditEventMutation
>;
export const createAuditBatch = /* GraphQL */ `mutation CreateAuditBatch(
  $input: CreateAuditBatchInput!
  $condition: ModelAuditBatchConditionInput
) {
  createAuditBatch(input: $input, condition: $condition) {
    id
    timestamp
    merkleRoot
    transactionHash
    events {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAuditBatchMutationVariables,
  APITypes.CreateAuditBatchMutation
>;
export const updateAuditBatch = /* GraphQL */ `mutation UpdateAuditBatch(
  $input: UpdateAuditBatchInput!
  $condition: ModelAuditBatchConditionInput
) {
  updateAuditBatch(input: $input, condition: $condition) {
    id
    timestamp
    merkleRoot
    transactionHash
    events {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAuditBatchMutationVariables,
  APITypes.UpdateAuditBatchMutation
>;
export const deleteAuditBatch = /* GraphQL */ `mutation DeleteAuditBatch(
  $input: DeleteAuditBatchInput!
  $condition: ModelAuditBatchConditionInput
) {
  deleteAuditBatch(input: $input, condition: $condition) {
    id
    timestamp
    merkleRoot
    transactionHash
    events {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAuditBatchMutationVariables,
  APITypes.DeleteAuditBatchMutation
>;
