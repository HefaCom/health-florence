/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
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
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const getDoctor = /* GraphQL */ `query GetDoctor($id: ID!) {
  getDoctor(id: $id) {
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
` as GeneratedQuery<APITypes.GetDoctorQueryVariables, APITypes.GetDoctorQuery>;
export const listDoctors = /* GraphQL */ `query ListDoctors(
  $filter: ModelDoctorFilterInput
  $limit: Int
  $nextToken: String
) {
  listDoctors(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDoctorsQueryVariables,
  APITypes.ListDoctorsQuery
>;
export const getAppointment = /* GraphQL */ `query GetAppointment($id: ID!) {
  getAppointment(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetAppointmentQueryVariables,
  APITypes.GetAppointmentQuery
>;
export const listAppointments = /* GraphQL */ `query ListAppointments(
  $filter: ModelAppointmentFilterInput
  $limit: Int
  $nextToken: String
) {
  listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      doctorId
      date
      status
      notes
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAppointmentsQueryVariables,
  APITypes.ListAppointmentsQuery
>;
