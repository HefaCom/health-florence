/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUser = /* GraphQL */ `subscription OnCreateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onCreateUser(filter: $filter, owner: $owner) {
    id
    email
    firstName
    lastName
    phoneNumber
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onUpdateUser(filter: $filter, owner: $owner) {
    id
    email
    firstName
    lastName
    phoneNumber
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onDeleteUser(filter: $filter, owner: $owner) {
    id
    email
    firstName
    lastName
    phoneNumber
    role
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateDoctor = /* GraphQL */ `subscription OnCreateDoctor($filter: ModelSubscriptionDoctorFilterInput) {
  onCreateDoctor(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDoctorSubscriptionVariables,
  APITypes.OnCreateDoctorSubscription
>;
export const onUpdateDoctor = /* GraphQL */ `subscription OnUpdateDoctor($filter: ModelSubscriptionDoctorFilterInput) {
  onUpdateDoctor(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDoctorSubscriptionVariables,
  APITypes.OnUpdateDoctorSubscription
>;
export const onDeleteDoctor = /* GraphQL */ `subscription OnDeleteDoctor($filter: ModelSubscriptionDoctorFilterInput) {
  onDeleteDoctor(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDoctorSubscriptionVariables,
  APITypes.OnDeleteDoctorSubscription
>;
export const onCreateAppointment = /* GraphQL */ `subscription OnCreateAppointment(
  $filter: ModelSubscriptionAppointmentFilterInput
  $owner: String
) {
  onCreateAppointment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAppointmentSubscriptionVariables,
  APITypes.OnCreateAppointmentSubscription
>;
export const onUpdateAppointment = /* GraphQL */ `subscription OnUpdateAppointment(
  $filter: ModelSubscriptionAppointmentFilterInput
  $owner: String
) {
  onUpdateAppointment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAppointmentSubscriptionVariables,
  APITypes.OnUpdateAppointmentSubscription
>;
export const onDeleteAppointment = /* GraphQL */ `subscription OnDeleteAppointment(
  $filter: ModelSubscriptionAppointmentFilterInput
  $owner: String
) {
  onDeleteAppointment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAppointmentSubscriptionVariables,
  APITypes.OnDeleteAppointmentSubscription
>;
