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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateExpert = /* GraphQL */ `subscription OnCreateExpert($filter: ModelSubscriptionExpertFilterInput) {
  onCreateExpert(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateExpertSubscriptionVariables,
  APITypes.OnCreateExpertSubscription
>;
export const onUpdateExpert = /* GraphQL */ `subscription OnUpdateExpert($filter: ModelSubscriptionExpertFilterInput) {
  onUpdateExpert(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateExpertSubscriptionVariables,
  APITypes.OnUpdateExpertSubscription
>;
export const onDeleteExpert = /* GraphQL */ `subscription OnDeleteExpert($filter: ModelSubscriptionExpertFilterInput) {
  onDeleteExpert(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteExpertSubscriptionVariables,
  APITypes.OnDeleteExpertSubscription
>;
export const onCreateAppointment = /* GraphQL */ `subscription OnCreateAppointment(
  $filter: ModelSubscriptionAppointmentFilterInput
  $owner: String
) {
  onCreateAppointment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAppointmentSubscriptionVariables,
  APITypes.OnDeleteAppointmentSubscription
>;
export const onCreateExpertPatient = /* GraphQL */ `subscription OnCreateExpertPatient(
  $filter: ModelSubscriptionExpertPatientFilterInput
  $owner: String
) {
  onCreateExpertPatient(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateExpertPatientSubscriptionVariables,
  APITypes.OnCreateExpertPatientSubscription
>;
export const onUpdateExpertPatient = /* GraphQL */ `subscription OnUpdateExpertPatient(
  $filter: ModelSubscriptionExpertPatientFilterInput
  $owner: String
) {
  onUpdateExpertPatient(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateExpertPatientSubscriptionVariables,
  APITypes.OnUpdateExpertPatientSubscription
>;
export const onDeleteExpertPatient = /* GraphQL */ `subscription OnDeleteExpertPatient(
  $filter: ModelSubscriptionExpertPatientFilterInput
  $owner: String
) {
  onDeleteExpertPatient(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteExpertPatientSubscriptionVariables,
  APITypes.OnDeleteExpertPatientSubscription
>;
export const onCreatePatientRecord = /* GraphQL */ `subscription OnCreatePatientRecord(
  $filter: ModelSubscriptionPatientRecordFilterInput
  $owner: String
) {
  onCreatePatientRecord(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePatientRecordSubscriptionVariables,
  APITypes.OnCreatePatientRecordSubscription
>;
export const onUpdatePatientRecord = /* GraphQL */ `subscription OnUpdatePatientRecord(
  $filter: ModelSubscriptionPatientRecordFilterInput
  $owner: String
) {
  onUpdatePatientRecord(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePatientRecordSubscriptionVariables,
  APITypes.OnUpdatePatientRecordSubscription
>;
export const onDeletePatientRecord = /* GraphQL */ `subscription OnDeletePatientRecord(
  $filter: ModelSubscriptionPatientRecordFilterInput
  $owner: String
) {
  onDeletePatientRecord(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePatientRecordSubscriptionVariables,
  APITypes.OnDeletePatientRecordSubscription
>;
export const onCreateAuditEvent = /* GraphQL */ `subscription OnCreateAuditEvent(
  $filter: ModelSubscriptionAuditEventFilterInput
) {
  onCreateAuditEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAuditEventSubscriptionVariables,
  APITypes.OnCreateAuditEventSubscription
>;
export const onUpdateAuditEvent = /* GraphQL */ `subscription OnUpdateAuditEvent(
  $filter: ModelSubscriptionAuditEventFilterInput
) {
  onUpdateAuditEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAuditEventSubscriptionVariables,
  APITypes.OnUpdateAuditEventSubscription
>;
export const onDeleteAuditEvent = /* GraphQL */ `subscription OnDeleteAuditEvent(
  $filter: ModelSubscriptionAuditEventFilterInput
) {
  onDeleteAuditEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAuditEventSubscriptionVariables,
  APITypes.OnDeleteAuditEventSubscription
>;
export const onCreateAuditBatch = /* GraphQL */ `subscription OnCreateAuditBatch(
  $filter: ModelSubscriptionAuditBatchFilterInput
) {
  onCreateAuditBatch(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAuditBatchSubscriptionVariables,
  APITypes.OnCreateAuditBatchSubscription
>;
export const onUpdateAuditBatch = /* GraphQL */ `subscription OnUpdateAuditBatch(
  $filter: ModelSubscriptionAuditBatchFilterInput
) {
  onUpdateAuditBatch(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAuditBatchSubscriptionVariables,
  APITypes.OnUpdateAuditBatchSubscription
>;
export const onDeleteAuditBatch = /* GraphQL */ `subscription OnDeleteAuditBatch(
  $filter: ModelSubscriptionAuditBatchFilterInput
) {
  onDeleteAuditBatch(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAuditBatchSubscriptionVariables,
  APITypes.OnDeleteAuditBatchSubscription
>;
export const onCreateDietaryPlan = /* GraphQL */ `subscription OnCreateDietaryPlan(
  $filter: ModelSubscriptionDietaryPlanFilterInput
  $owner: String
) {
  onCreateDietaryPlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDietaryPlanSubscriptionVariables,
  APITypes.OnCreateDietaryPlanSubscription
>;
export const onUpdateDietaryPlan = /* GraphQL */ `subscription OnUpdateDietaryPlan(
  $filter: ModelSubscriptionDietaryPlanFilterInput
  $owner: String
) {
  onUpdateDietaryPlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDietaryPlanSubscriptionVariables,
  APITypes.OnUpdateDietaryPlanSubscription
>;
export const onDeleteDietaryPlan = /* GraphQL */ `subscription OnDeleteDietaryPlan(
  $filter: ModelSubscriptionDietaryPlanFilterInput
  $owner: String
) {
  onDeleteDietaryPlan(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDietaryPlanSubscriptionVariables,
  APITypes.OnDeleteDietaryPlanSubscription
>;
export const onCreateHealthGoal = /* GraphQL */ `subscription OnCreateHealthGoal(
  $filter: ModelSubscriptionHealthGoalFilterInput
  $owner: String
) {
  onCreateHealthGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateHealthGoalSubscriptionVariables,
  APITypes.OnCreateHealthGoalSubscription
>;
export const onUpdateHealthGoal = /* GraphQL */ `subscription OnUpdateHealthGoal(
  $filter: ModelSubscriptionHealthGoalFilterInput
  $owner: String
) {
  onUpdateHealthGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateHealthGoalSubscriptionVariables,
  APITypes.OnUpdateHealthGoalSubscription
>;
export const onDeleteHealthGoal = /* GraphQL */ `subscription OnDeleteHealthGoal(
  $filter: ModelSubscriptionHealthGoalFilterInput
  $owner: String
) {
  onDeleteHealthGoal(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteHealthGoalSubscriptionVariables,
  APITypes.OnDeleteHealthGoalSubscription
>;
export const onCreateHealthCondition = /* GraphQL */ `subscription OnCreateHealthCondition(
  $filter: ModelSubscriptionHealthConditionFilterInput
  $owner: String
) {
  onCreateHealthCondition(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateHealthConditionSubscriptionVariables,
  APITypes.OnCreateHealthConditionSubscription
>;
export const onUpdateHealthCondition = /* GraphQL */ `subscription OnUpdateHealthCondition(
  $filter: ModelSubscriptionHealthConditionFilterInput
  $owner: String
) {
  onUpdateHealthCondition(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateHealthConditionSubscriptionVariables,
  APITypes.OnUpdateHealthConditionSubscription
>;
export const onDeleteHealthCondition = /* GraphQL */ `subscription OnDeleteHealthCondition(
  $filter: ModelSubscriptionHealthConditionFilterInput
  $owner: String
) {
  onDeleteHealthCondition(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteHealthConditionSubscriptionVariables,
  APITypes.OnDeleteHealthConditionSubscription
>;
export const onCreateHAICReward = /* GraphQL */ `subscription OnCreateHAICReward(
  $filter: ModelSubscriptionHAICRewardFilterInput
  $owner: String
) {
  onCreateHAICReward(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateHAICRewardSubscriptionVariables,
  APITypes.OnCreateHAICRewardSubscription
>;
export const onUpdateHAICReward = /* GraphQL */ `subscription OnUpdateHAICReward(
  $filter: ModelSubscriptionHAICRewardFilterInput
  $owner: String
) {
  onUpdateHAICReward(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateHAICRewardSubscriptionVariables,
  APITypes.OnUpdateHAICRewardSubscription
>;
export const onDeleteHAICReward = /* GraphQL */ `subscription OnDeleteHAICReward(
  $filter: ModelSubscriptionHAICRewardFilterInput
  $owner: String
) {
  onDeleteHAICReward(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteHAICRewardSubscriptionVariables,
  APITypes.OnDeleteHAICRewardSubscription
>;
