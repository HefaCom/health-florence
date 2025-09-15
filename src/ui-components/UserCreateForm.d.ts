/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UserCreateFormInputValues = {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    allergies?: string;
    medicalConditions?: string;
    currentMedications?: string;
    height?: number;
    weight?: number;
    gender?: string;
    bloodType?: string;
    role?: string;
    isActive?: boolean;
    lastLoginAt?: string;
    loginCount?: number;
    preferences?: string;
    notificationSettings?: string;
    privacySettings?: string;
    subscriptionTier?: string;
    subscriptionExpiresAt?: string;
    profilePicture?: string;
    medicalDocuments?: string;
    createdAt?: string;
    updatedAt?: string;
};
export declare type UserCreateFormValidationValues = {
    email?: ValidationFunction<string>;
    firstName?: ValidationFunction<string>;
    lastName?: ValidationFunction<string>;
    phoneNumber?: ValidationFunction<string>;
    dateOfBirth?: ValidationFunction<string>;
    address?: ValidationFunction<string>;
    city?: ValidationFunction<string>;
    state?: ValidationFunction<string>;
    zipCode?: ValidationFunction<string>;
    emergencyContactName?: ValidationFunction<string>;
    emergencyContactPhone?: ValidationFunction<string>;
    allergies?: ValidationFunction<string>;
    medicalConditions?: ValidationFunction<string>;
    currentMedications?: ValidationFunction<string>;
    height?: ValidationFunction<number>;
    weight?: ValidationFunction<number>;
    gender?: ValidationFunction<string>;
    bloodType?: ValidationFunction<string>;
    role?: ValidationFunction<string>;
    isActive?: ValidationFunction<boolean>;
    lastLoginAt?: ValidationFunction<string>;
    loginCount?: ValidationFunction<number>;
    preferences?: ValidationFunction<string>;
    notificationSettings?: ValidationFunction<string>;
    privacySettings?: ValidationFunction<string>;
    subscriptionTier?: ValidationFunction<string>;
    subscriptionExpiresAt?: ValidationFunction<string>;
    profilePicture?: ValidationFunction<string>;
    medicalDocuments?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UserCreateFormOverridesProps = {
    UserCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    firstName?: PrimitiveOverrideProps<TextFieldProps>;
    lastName?: PrimitiveOverrideProps<TextFieldProps>;
    phoneNumber?: PrimitiveOverrideProps<TextFieldProps>;
    dateOfBirth?: PrimitiveOverrideProps<TextFieldProps>;
    address?: PrimitiveOverrideProps<TextFieldProps>;
    city?: PrimitiveOverrideProps<TextFieldProps>;
    state?: PrimitiveOverrideProps<TextFieldProps>;
    zipCode?: PrimitiveOverrideProps<TextFieldProps>;
    emergencyContactName?: PrimitiveOverrideProps<TextFieldProps>;
    emergencyContactPhone?: PrimitiveOverrideProps<TextFieldProps>;
    allergies?: PrimitiveOverrideProps<TextFieldProps>;
    medicalConditions?: PrimitiveOverrideProps<TextFieldProps>;
    currentMedications?: PrimitiveOverrideProps<TextFieldProps>;
    height?: PrimitiveOverrideProps<TextFieldProps>;
    weight?: PrimitiveOverrideProps<TextFieldProps>;
    gender?: PrimitiveOverrideProps<TextFieldProps>;
    bloodType?: PrimitiveOverrideProps<TextFieldProps>;
    role?: PrimitiveOverrideProps<TextFieldProps>;
    isActive?: PrimitiveOverrideProps<SwitchFieldProps>;
    lastLoginAt?: PrimitiveOverrideProps<TextFieldProps>;
    loginCount?: PrimitiveOverrideProps<TextFieldProps>;
    preferences?: PrimitiveOverrideProps<TextAreaFieldProps>;
    notificationSettings?: PrimitiveOverrideProps<TextAreaFieldProps>;
    privacySettings?: PrimitiveOverrideProps<TextAreaFieldProps>;
    subscriptionTier?: PrimitiveOverrideProps<TextFieldProps>;
    subscriptionExpiresAt?: PrimitiveOverrideProps<TextFieldProps>;
    profilePicture?: PrimitiveOverrideProps<TextFieldProps>;
    medicalDocuments?: PrimitiveOverrideProps<TextAreaFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UserCreateFormProps = React.PropsWithChildren<{
    overrides?: UserCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: UserCreateFormInputValues) => UserCreateFormInputValues;
    onSuccess?: (fields: UserCreateFormInputValues) => void;
    onError?: (fields: UserCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UserCreateFormInputValues) => UserCreateFormInputValues;
    onValidate?: UserCreateFormValidationValues;
} & React.CSSProperties>;
export default function UserCreateForm(props: UserCreateFormProps): React.ReactElement;
