import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";





type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
  };
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber?: string | null;
  readonly dateOfBirth?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zipCode?: string | null;
  readonly emergencyContactName?: string | null;
  readonly emergencyContactPhone?: string | null;
  readonly allergies?: string | null;
  readonly medicalConditions?: string | null;
  readonly currentMedications?: string | null;
  readonly height?: number | null;
  readonly weight?: number | null;
  readonly gender?: string | null;
  readonly bloodType?: string | null;
  readonly role: string;
  readonly isActive: boolean;
  readonly lastLoginAt?: string | null;
  readonly loginCount: number;
  readonly preferences?: string | null;
  readonly notificationSettings?: string | null;
  readonly privacySettings?: string | null;
  readonly subscriptionTier?: string | null;
  readonly subscriptionExpiresAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly dietaryPlans?: (DietaryPlan | null)[] | null;
  readonly healthGoals?: (HealthGoal | null)[] | null;
  readonly healthConditions?: (HealthCondition | null)[] | null;
  readonly haicRewards?: (HAICReward | null)[] | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
  };
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber?: string | null;
  readonly dateOfBirth?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zipCode?: string | null;
  readonly emergencyContactName?: string | null;
  readonly emergencyContactPhone?: string | null;
  readonly allergies?: string | null;
  readonly medicalConditions?: string | null;
  readonly currentMedications?: string | null;
  readonly height?: number | null;
  readonly weight?: number | null;
  readonly gender?: string | null;
  readonly bloodType?: string | null;
  readonly role: string;
  readonly isActive: boolean;
  readonly lastLoginAt?: string | null;
  readonly loginCount: number;
  readonly preferences?: string | null;
  readonly notificationSettings?: string | null;
  readonly privacySettings?: string | null;
  readonly subscriptionTier?: string | null;
  readonly subscriptionExpiresAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly dietaryPlans: AsyncCollection<DietaryPlan>;
  readonly healthGoals: AsyncCollection<HealthGoal>;
  readonly healthConditions: AsyncCollection<HealthCondition>;
  readonly haicRewards: AsyncCollection<HAICReward>;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerExpert = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Expert, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly user?: User | null;
  readonly specialization: string;
  readonly subSpecializations?: (string | null)[] | null;
  readonly licenseNumber: string;
  readonly yearsOfExperience: number;
  readonly education?: (string | null)[] | null;
  readonly certifications?: (string | null)[] | null;
  readonly languages?: (string | null)[] | null;
  readonly practiceName?: string | null;
  readonly practiceAddress?: string | null;
  readonly practicePhone?: string | null;
  readonly practiceEmail?: string | null;
  readonly practiceWebsite?: string | null;
  readonly availability?: string | null;
  readonly consultationFee?: number | null;
  readonly services?: (string | null)[] | null;
  readonly bio?: string | null;
  readonly profileImage?: string | null;
  readonly coverImage?: string | null;
  readonly documents?: string | null;
  readonly isVerified: boolean;
  readonly isActive: boolean;
  readonly verificationStatus?: string | null;
  readonly appointments?: (Appointment | null)[] | null;
  readonly expertPatients?: (ExpertPatient | null)[] | null;
  readonly patientRecords?: (PatientRecord | null)[] | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyExpert = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Expert, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly user: AsyncItem<User | undefined>;
  readonly specialization: string;
  readonly subSpecializations?: (string | null)[] | null;
  readonly licenseNumber: string;
  readonly yearsOfExperience: number;
  readonly education?: (string | null)[] | null;
  readonly certifications?: (string | null)[] | null;
  readonly languages?: (string | null)[] | null;
  readonly practiceName?: string | null;
  readonly practiceAddress?: string | null;
  readonly practicePhone?: string | null;
  readonly practiceEmail?: string | null;
  readonly practiceWebsite?: string | null;
  readonly availability?: string | null;
  readonly consultationFee?: number | null;
  readonly services?: (string | null)[] | null;
  readonly bio?: string | null;
  readonly profileImage?: string | null;
  readonly coverImage?: string | null;
  readonly documents?: string | null;
  readonly isVerified: boolean;
  readonly isActive: boolean;
  readonly verificationStatus?: string | null;
  readonly appointments: AsyncCollection<Appointment>;
  readonly expertPatients: AsyncCollection<ExpertPatient>;
  readonly patientRecords: AsyncCollection<PatientRecord>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Expert = LazyLoading extends LazyLoadingDisabled ? EagerExpert : LazyExpert

export declare const Expert: (new (init: ModelInit<Expert>) => Expert) & {
  copyOf(source: Expert, mutator: (draft: MutableModel<Expert>) => MutableModel<Expert> | void): Expert;
}

type EagerAppointment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Appointment, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly expertId: string;
  readonly date: string;
  readonly status: string;
  readonly type: string;
  readonly duration?: number | null;
  readonly notes?: string | null;
  readonly symptoms?: string | null;
  readonly diagnosis?: string | null;
  readonly prescription?: string | null;
  readonly followUpDate?: string | null;
  readonly user?: User | null;
  readonly expert?: Expert | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyAppointment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Appointment, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly expertId: string;
  readonly date: string;
  readonly status: string;
  readonly type: string;
  readonly duration?: number | null;
  readonly notes?: string | null;
  readonly symptoms?: string | null;
  readonly diagnosis?: string | null;
  readonly prescription?: string | null;
  readonly followUpDate?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly expert: AsyncItem<Expert | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Appointment = LazyLoading extends LazyLoadingDisabled ? EagerAppointment : LazyAppointment

export declare const Appointment: (new (init: ModelInit<Appointment>) => Appointment) & {
  copyOf(source: Appointment, mutator: (draft: MutableModel<Appointment>) => MutableModel<Appointment> | void): Appointment;
}

type EagerExpertPatient = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ExpertPatient, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly expertId: string;
  readonly status: string;
  readonly addedAt: string;
  readonly notes?: string | null;
  readonly user?: User | null;
  readonly expert?: Expert | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyExpertPatient = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ExpertPatient, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly expertId: string;
  readonly status: string;
  readonly addedAt: string;
  readonly notes?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly expert: AsyncItem<Expert | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type ExpertPatient = LazyLoading extends LazyLoadingDisabled ? EagerExpertPatient : LazyExpertPatient

export declare const ExpertPatient: (new (init: ModelInit<ExpertPatient>) => ExpertPatient) & {
  copyOf(source: ExpertPatient, mutator: (draft: MutableModel<ExpertPatient>) => MutableModel<ExpertPatient> | void): ExpertPatient;
}

type EagerPatientRecord = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PatientRecord, 'id'>;
  };
  readonly id: string;
  readonly expertId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth?: string | null;
  readonly gender?: string | null;
  readonly phoneNumber?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
  readonly emergencyContact?: string | null;
  readonly medicalHistory?: string | null;
  readonly allergies?: string | null;
  readonly currentMedications?: string | null;
  readonly familyHistory?: string | null;
  readonly appointments?: (string | null)[] | null;
  readonly notes?: string | null;
  readonly documents?: (string | null)[] | null;
  readonly expert?: Expert | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyPatientRecord = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PatientRecord, 'id'>;
  };
  readonly id: string;
  readonly expertId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth?: string | null;
  readonly gender?: string | null;
  readonly phoneNumber?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
  readonly emergencyContact?: string | null;
  readonly medicalHistory?: string | null;
  readonly allergies?: string | null;
  readonly currentMedications?: string | null;
  readonly familyHistory?: string | null;
  readonly appointments?: (string | null)[] | null;
  readonly notes?: string | null;
  readonly documents?: (string | null)[] | null;
  readonly expert: AsyncItem<Expert | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type PatientRecord = LazyLoading extends LazyLoadingDisabled ? EagerPatientRecord : LazyPatientRecord

export declare const PatientRecord: (new (init: ModelInit<PatientRecord>) => PatientRecord) & {
  copyOf(source: PatientRecord, mutator: (draft: MutableModel<PatientRecord>) => MutableModel<PatientRecord> | void): PatientRecord;
}

type EagerAuditEvent = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<AuditEvent, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly timestamp: string;
  readonly userId: string;
  readonly action: string;
  readonly resourceId: string;
  readonly details: string;
  readonly transactionHash?: string | null;
  readonly merkleRoot?: string | null;
  readonly batchId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly auditBatchEventsId?: string | null;
}

type LazyAuditEvent = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<AuditEvent, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly timestamp: string;
  readonly userId: string;
  readonly action: string;
  readonly resourceId: string;
  readonly details: string;
  readonly transactionHash?: string | null;
  readonly merkleRoot?: string | null;
  readonly batchId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly auditBatchEventsId?: string | null;
}

export declare type AuditEvent = LazyLoading extends LazyLoadingDisabled ? EagerAuditEvent : LazyAuditEvent

export declare const AuditEvent: (new (init: ModelInit<AuditEvent>) => AuditEvent) & {
  copyOf(source: AuditEvent, mutator: (draft: MutableModel<AuditEvent>) => MutableModel<AuditEvent> | void): AuditEvent;
}

type EagerAuditBatch = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<AuditBatch, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly timestamp: string;
  readonly merkleRoot: string;
  readonly transactionHash: string;
  readonly events?: (AuditEvent | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyAuditBatch = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<AuditBatch, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly timestamp: string;
  readonly merkleRoot: string;
  readonly transactionHash: string;
  readonly events: AsyncCollection<AuditEvent>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type AuditBatch = LazyLoading extends LazyLoadingDisabled ? EagerAuditBatch : LazyAuditBatch

export declare const AuditBatch: (new (init: ModelInit<AuditBatch>) => AuditBatch) & {
  copyOf(source: AuditBatch, mutator: (draft: MutableModel<AuditBatch>) => MutableModel<AuditBatch> | void): AuditBatch;
}

type EagerDietaryPlan = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DietaryPlan, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string;
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly fiber: number;
  readonly isRecommended: boolean;
  readonly isCompleted: boolean;
  readonly time?: string | null;
  readonly reason?: string | null;
  readonly user?: User | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyDietaryPlan = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DietaryPlan, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string;
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly fiber: number;
  readonly isRecommended: boolean;
  readonly isCompleted: boolean;
  readonly time?: string | null;
  readonly reason?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type DietaryPlan = LazyLoading extends LazyLoadingDisabled ? EagerDietaryPlan : LazyDietaryPlan

export declare const DietaryPlan: (new (init: ModelInit<DietaryPlan>) => DietaryPlan) & {
  copyOf(source: DietaryPlan, mutator: (draft: MutableModel<DietaryPlan>) => MutableModel<DietaryPlan> | void): DietaryPlan;
}

type EagerHealthGoal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HealthGoal, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly target: number;
  readonly current: number;
  readonly unit: string;
  readonly deadline: string;
  readonly isCompleted: boolean;
  readonly isRecommended: boolean;
  readonly priority: string;
  readonly reward: number;
  readonly reason?: string | null;
  readonly user?: User | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyHealthGoal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HealthGoal, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly target: number;
  readonly current: number;
  readonly unit: string;
  readonly deadline: string;
  readonly isCompleted: boolean;
  readonly isRecommended: boolean;
  readonly priority: string;
  readonly reward: number;
  readonly reason?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type HealthGoal = LazyLoading extends LazyLoadingDisabled ? EagerHealthGoal : LazyHealthGoal

export declare const HealthGoal: (new (init: ModelInit<HealthGoal>) => HealthGoal) & {
  copyOf(source: HealthGoal, mutator: (draft: MutableModel<HealthGoal>) => MutableModel<HealthGoal> | void): HealthGoal;
}

type EagerHealthCondition = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HealthCondition, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly severity: string;
  readonly status: string;
  readonly diagnosedDate: string;
  readonly description: string;
  readonly medications?: string | null;
  readonly user?: User | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyHealthCondition = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HealthCondition, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly severity: string;
  readonly status: string;
  readonly diagnosedDate: string;
  readonly description: string;
  readonly medications?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type HealthCondition = LazyLoading extends LazyLoadingDisabled ? EagerHealthCondition : LazyHealthCondition

export declare const HealthCondition: (new (init: ModelInit<HealthCondition>) => HealthCondition) & {
  copyOf(source: HealthCondition, mutator: (draft: MutableModel<HealthCondition>) => MutableModel<HealthCondition> | void): HealthCondition;
}

type EagerHAICReward = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HAICReward, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly amount: number;
  readonly reason: string;
  readonly category: string;
  readonly transactionHash?: string | null;
  readonly user?: User | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyHAICReward = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<HAICReward, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly amount: number;
  readonly reason: string;
  readonly category: string;
  readonly transactionHash?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type HAICReward = LazyLoading extends LazyLoadingDisabled ? EagerHAICReward : LazyHAICReward

export declare const HAICReward: (new (init: ModelInit<HAICReward>) => HAICReward) & {
  copyOf(source: HAICReward, mutator: (draft: MutableModel<HAICReward>) => MutableModel<HAICReward> | void): HAICReward;
}

type EagerNotification = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notification, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly data?: string | null;
  readonly isRead: boolean;
  readonly actionUrl?: string | null;
  readonly user?: User | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyNotification = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notification, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly data?: string | null;
  readonly isRead: boolean;
  readonly actionUrl?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Notification = LazyLoading extends LazyLoadingDisabled ? EagerNotification : LazyNotification

export declare const Notification: (new (init: ModelInit<Notification>) => Notification) & {
  copyOf(source: Notification, mutator: (draft: MutableModel<Notification>) => MutableModel<Notification> | void): Notification;
}