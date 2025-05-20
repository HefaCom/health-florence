import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem, AsyncCollection } from "@aws-amplify/datastore";





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
  readonly role: string;
  readonly createdAt: string;
  readonly updatedAt: string;
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
  readonly role: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerDoctor = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Doctor, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly specialization: string;
  readonly licenseNumber: string;
  readonly yearsOfExperience: number;
  readonly user?: User | null;
  readonly appointments?: (Appointment | null)[] | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyDoctor = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Doctor, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly specialization: string;
  readonly licenseNumber: string;
  readonly yearsOfExperience: number;
  readonly user: AsyncItem<User | undefined>;
  readonly appointments: AsyncCollection<Appointment>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Doctor = LazyLoading extends LazyLoadingDisabled ? EagerDoctor : LazyDoctor

export declare const Doctor: (new (init: ModelInit<Doctor>) => Doctor) & {
  copyOf(source: Doctor, mutator: (draft: MutableModel<Doctor>) => MutableModel<Doctor> | void): Doctor;
}

type EagerAppointment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Appointment, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly doctorId: string;
  readonly date: string;
  readonly status: string;
  readonly notes?: string | null;
  readonly user?: User | null;
  readonly doctor?: Doctor | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyAppointment = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Appointment, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly doctorId: string;
  readonly date: string;
  readonly status: string;
  readonly notes?: string | null;
  readonly user: AsyncItem<User | undefined>;
  readonly doctor: AsyncItem<Doctor | undefined>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Appointment = LazyLoading extends LazyLoadingDisabled ? EagerAppointment : LazyAppointment

export declare const Appointment: (new (init: ModelInit<Appointment>) => Appointment) & {
  copyOf(source: Appointment, mutator: (draft: MutableModel<Appointment>) => MutableModel<Appointment> | void): Appointment;
}