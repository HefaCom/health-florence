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
    height
    weight
    gender
    bloodType
    role
    isActive
    lastLoginAt
    loginCount
    preferences
    notificationSettings
    privacySettings
    subscriptionTier
    subscriptionExpiresAt
    createdAt
    updatedAt
    dietaryPlans {
      nextToken
      __typename
    }
    healthGoals {
      nextToken
      __typename
    }
    healthConditions {
      nextToken
      __typename
    }
    haicRewards {
      nextToken
      __typename
    }
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
export const getAuditEvent = /* GraphQL */ `query GetAuditEvent($id: ID!) {
  getAuditEvent(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetAuditEventQueryVariables,
  APITypes.GetAuditEventQuery
>;
export const listAuditEvents = /* GraphQL */ `query ListAuditEvents(
  $filter: ModelAuditEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listAuditEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAuditEventsQueryVariables,
  APITypes.ListAuditEventsQuery
>;
export const getAuditBatch = /* GraphQL */ `query GetAuditBatch($id: ID!) {
  getAuditBatch(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetAuditBatchQueryVariables,
  APITypes.GetAuditBatchQuery
>;
export const listAuditBatches = /* GraphQL */ `query ListAuditBatches(
  $filter: ModelAuditBatchFilterInput
  $limit: Int
  $nextToken: String
) {
  listAuditBatches(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      timestamp
      merkleRoot
      transactionHash
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAuditBatchesQueryVariables,
  APITypes.ListAuditBatchesQuery
>;
export const getDietaryPlan = /* GraphQL */ `query GetDietaryPlan($id: ID!) {
  getDietaryPlan(id: $id) {
    id
    userId
    name
    category
    calories
    protein
    carbs
    fat
    fiber
    isRecommended
    isCompleted
    time
    reason
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
  APITypes.GetDietaryPlanQueryVariables,
  APITypes.GetDietaryPlanQuery
>;
export const listDietaryPlans = /* GraphQL */ `query ListDietaryPlans(
  $filter: ModelDietaryPlanFilterInput
  $limit: Int
  $nextToken: String
) {
  listDietaryPlans(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      name
      category
      calories
      protein
      carbs
      fat
      fiber
      isRecommended
      isCompleted
      time
      reason
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
  APITypes.ListDietaryPlansQueryVariables,
  APITypes.ListDietaryPlansQuery
>;
export const getHealthGoal = /* GraphQL */ `query GetHealthGoal($id: ID!) {
  getHealthGoal(id: $id) {
    id
    userId
    title
    description
    category
    target
    current
    unit
    deadline
    isCompleted
    isRecommended
    priority
    reward
    reason
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
  APITypes.GetHealthGoalQueryVariables,
  APITypes.GetHealthGoalQuery
>;
export const listHealthGoals = /* GraphQL */ `query ListHealthGoals(
  $filter: ModelHealthGoalFilterInput
  $limit: Int
  $nextToken: String
) {
  listHealthGoals(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      title
      description
      category
      target
      current
      unit
      deadline
      isCompleted
      isRecommended
      priority
      reward
      reason
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
  APITypes.ListHealthGoalsQueryVariables,
  APITypes.ListHealthGoalsQuery
>;
export const getHealthCondition = /* GraphQL */ `query GetHealthCondition($id: ID!) {
  getHealthCondition(id: $id) {
    id
    userId
    name
    severity
    status
    diagnosedDate
    description
    medications
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
  APITypes.GetHealthConditionQueryVariables,
  APITypes.GetHealthConditionQuery
>;
export const listHealthConditions = /* GraphQL */ `query ListHealthConditions(
  $filter: ModelHealthConditionFilterInput
  $limit: Int
  $nextToken: String
) {
  listHealthConditions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      name
      severity
      status
      diagnosedDate
      description
      medications
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
  APITypes.ListHealthConditionsQueryVariables,
  APITypes.ListHealthConditionsQuery
>;
export const getHAICReward = /* GraphQL */ `query GetHAICReward($id: ID!) {
  getHAICReward(id: $id) {
    id
    userId
    amount
    reason
    category
    transactionHash
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
      height
      weight
      gender
      bloodType
      role
      isActive
      lastLoginAt
      loginCount
      preferences
      notificationSettings
      privacySettings
      subscriptionTier
      subscriptionExpiresAt
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
  APITypes.GetHAICRewardQueryVariables,
  APITypes.GetHAICRewardQuery
>;
export const listHAICRewards = /* GraphQL */ `query ListHAICRewards(
  $filter: ModelHAICRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  listHAICRewards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      amount
      reason
      category
      transactionHash
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
  APITypes.ListHAICRewardsQueryVariables,
  APITypes.ListHAICRewardsQuery
>;
