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
    profilePicture
    medicalDocuments
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
    haicTransactions {
      nextToken
      __typename
    }
    healthMetrics {
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
      profilePicture
      medicalDocuments
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
export const getExpert = /* GraphQL */ `query GetExpert($id: ID!) {
  getExpert(id: $id) {
    id
    userId
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
      profilePicture
      medicalDocuments
      createdAt
      updatedAt
      owner
      __typename
    }
    specialization
    subSpecializations
    licenseNumber
    yearsOfExperience
    education
    certifications
    languages
    practiceName
    practiceAddress
    practicePhone
    practiceEmail
    practiceWebsite
    availability
    consultationFee
    services
    bio
    profileImage
    coverImage
    documents
    isVerified
    isActive
    verificationStatus
    appointments {
      nextToken
      __typename
    }
    expertPatients {
      nextToken
      __typename
    }
    patientRecords {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetExpertQueryVariables, APITypes.GetExpertQuery>;
export const listExperts = /* GraphQL */ `query ListExperts(
  $filter: ModelExpertFilterInput
  $limit: Int
  $nextToken: String
) {
  listExperts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      specialization
      subSpecializations
      licenseNumber
      yearsOfExperience
      education
      certifications
      languages
      practiceName
      practiceAddress
      practicePhone
      practiceEmail
      practiceWebsite
      availability
      consultationFee
      services
      bio
      profileImage
      coverImage
      documents
      isVerified
      isActive
      verificationStatus
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
  APITypes.ListExpertsQueryVariables,
  APITypes.ListExpertsQuery
>;
export const getAppointment = /* GraphQL */ `query GetAppointment($id: ID!) {
  getAppointment(id: $id) {
    id
    userId
    expertId
    date
    status
    type
    duration
    notes
    symptoms
    diagnosis
    prescription
    followUpDate
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
      profilePicture
      medicalDocuments
      createdAt
      updatedAt
      owner
      __typename
    }
    expert {
      id
      userId
      specialization
      subSpecializations
      licenseNumber
      yearsOfExperience
      education
      certifications
      languages
      practiceName
      practiceAddress
      practicePhone
      practiceEmail
      practiceWebsite
      availability
      consultationFee
      services
      bio
      profileImage
      coverImage
      documents
      isVerified
      isActive
      verificationStatus
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
      expertId
      date
      status
      type
      duration
      notes
      symptoms
      diagnosis
      prescription
      followUpDate
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
export const getExpertPatient = /* GraphQL */ `query GetExpertPatient($id: ID!) {
  getExpertPatient(id: $id) {
    id
    userId
    expertId
    status
    addedAt
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
      profilePicture
      medicalDocuments
      createdAt
      updatedAt
      owner
      __typename
    }
    expert {
      id
      userId
      specialization
      subSpecializations
      licenseNumber
      yearsOfExperience
      education
      certifications
      languages
      practiceName
      practiceAddress
      practicePhone
      practiceEmail
      practiceWebsite
      availability
      consultationFee
      services
      bio
      profileImage
      coverImage
      documents
      isVerified
      isActive
      verificationStatus
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
  APITypes.GetExpertPatientQueryVariables,
  APITypes.GetExpertPatientQuery
>;
export const listExpertPatients = /* GraphQL */ `query ListExpertPatients(
  $filter: ModelExpertPatientFilterInput
  $limit: Int
  $nextToken: String
) {
  listExpertPatients(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      expertId
      status
      addedAt
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
  APITypes.ListExpertPatientsQueryVariables,
  APITypes.ListExpertPatientsQuery
>;
export const getPatientRecord = /* GraphQL */ `query GetPatientRecord($id: ID!) {
  getPatientRecord(id: $id) {
    id
    expertId
    firstName
    lastName
    dateOfBirth
    gender
    phoneNumber
    email
    address
    emergencyContact
    medicalHistory
    allergies
    currentMedications
    familyHistory
    appointments
    notes
    documents
    expert {
      id
      userId
      specialization
      subSpecializations
      licenseNumber
      yearsOfExperience
      education
      certifications
      languages
      practiceName
      practiceAddress
      practicePhone
      practiceEmail
      practiceWebsite
      availability
      consultationFee
      services
      bio
      profileImage
      coverImage
      documents
      isVerified
      isActive
      verificationStatus
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
  APITypes.GetPatientRecordQueryVariables,
  APITypes.GetPatientRecordQuery
>;
export const listPatientRecords = /* GraphQL */ `query ListPatientRecords(
  $filter: ModelPatientRecordFilterInput
  $limit: Int
  $nextToken: String
) {
  listPatientRecords(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      expertId
      firstName
      lastName
      dateOfBirth
      gender
      phoneNumber
      email
      address
      emergencyContact
      medicalHistory
      allergies
      currentMedications
      familyHistory
      appointments
      notes
      documents
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
  APITypes.ListPatientRecordsQueryVariables,
  APITypes.ListPatientRecordsQuery
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
      profilePicture
      medicalDocuments
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
      profilePicture
      medicalDocuments
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
      profilePicture
      medicalDocuments
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
      profilePicture
      medicalDocuments
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
export const getHealthMetrics = /* GraphQL */ `query GetHealthMetrics($id: ID!) {
  getHealthMetrics(id: $id) {
    id
    userId
    heartRate
    heartRateTarget
    steps
    stepsTarget
    activityMinutes
    activityTarget
    sleepHours
    sleepTarget
    date
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
      profilePicture
      medicalDocuments
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
  APITypes.GetHealthMetricsQueryVariables,
  APITypes.GetHealthMetricsQuery
>;
export const listHealthMetrics = /* GraphQL */ `query ListHealthMetrics(
  $filter: ModelHealthMetricsFilterInput
  $limit: Int
  $nextToken: String
) {
  listHealthMetrics(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      heartRate
      heartRateTarget
      steps
      stepsTarget
      activityMinutes
      activityTarget
      sleepHours
      sleepTarget
      date
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
  APITypes.ListHealthMetricsQueryVariables,
  APITypes.ListHealthMetricsQuery
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
    severity
    category
    outcome
    ipAddress
    userAgent
    sessionId
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
      severity
      category
      outcome
      ipAddress
      userAgent
      sessionId
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
    status
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
      status
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
export const getHAICTransaction = /* GraphQL */ `query GetHAICTransaction($id: ID!) {
  getHAICTransaction(id: $id) {
    id
    userId
    type
    amount
    balance
    description
    transactionHash
    blockNumber
    status
    gasUsed
    gasPrice
    recipientAddress
    senderAddress
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
      profilePicture
      medicalDocuments
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
  APITypes.GetHAICTransactionQueryVariables,
  APITypes.GetHAICTransactionQuery
>;
export const listHAICTransactions = /* GraphQL */ `query ListHAICTransactions(
  $filter: ModelHAICTransactionFilterInput
  $limit: Int
  $nextToken: String
) {
  listHAICTransactions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      type
      amount
      balance
      description
      transactionHash
      blockNumber
      status
      gasUsed
      gasPrice
      recipientAddress
      senderAddress
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
  APITypes.ListHAICTransactionsQueryVariables,
  APITypes.ListHAICTransactionsQuery
>;
