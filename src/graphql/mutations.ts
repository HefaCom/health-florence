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
