/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type AuditEventCreateFormInputValues = {
    timestamp?: string;
    userId?: string;
    action?: string;
    resourceId?: string;
    details?: string;
    transactionHash?: string;
    merkleRoot?: string;
    batchId?: string;
    severity?: string;
    category?: string;
    outcome?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
};
export declare type AuditEventCreateFormValidationValues = {
    timestamp?: ValidationFunction<string>;
    userId?: ValidationFunction<string>;
    action?: ValidationFunction<string>;
    resourceId?: ValidationFunction<string>;
    details?: ValidationFunction<string>;
    transactionHash?: ValidationFunction<string>;
    merkleRoot?: ValidationFunction<string>;
    batchId?: ValidationFunction<string>;
    severity?: ValidationFunction<string>;
    category?: ValidationFunction<string>;
    outcome?: ValidationFunction<string>;
    ipAddress?: ValidationFunction<string>;
    userAgent?: ValidationFunction<string>;
    sessionId?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuditEventCreateFormOverridesProps = {
    AuditEventCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    timestamp?: PrimitiveOverrideProps<TextFieldProps>;
    userId?: PrimitiveOverrideProps<TextFieldProps>;
    action?: PrimitiveOverrideProps<TextFieldProps>;
    resourceId?: PrimitiveOverrideProps<TextFieldProps>;
    details?: PrimitiveOverrideProps<TextAreaFieldProps>;
    transactionHash?: PrimitiveOverrideProps<TextFieldProps>;
    merkleRoot?: PrimitiveOverrideProps<TextFieldProps>;
    batchId?: PrimitiveOverrideProps<TextFieldProps>;
    severity?: PrimitiveOverrideProps<TextFieldProps>;
    category?: PrimitiveOverrideProps<TextFieldProps>;
    outcome?: PrimitiveOverrideProps<TextFieldProps>;
    ipAddress?: PrimitiveOverrideProps<TextFieldProps>;
    userAgent?: PrimitiveOverrideProps<TextFieldProps>;
    sessionId?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuditEventCreateFormProps = React.PropsWithChildren<{
    overrides?: AuditEventCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: AuditEventCreateFormInputValues) => AuditEventCreateFormInputValues;
    onSuccess?: (fields: AuditEventCreateFormInputValues) => void;
    onError?: (fields: AuditEventCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuditEventCreateFormInputValues) => AuditEventCreateFormInputValues;
    onValidate?: AuditEventCreateFormValidationValues;
} & React.CSSProperties>;
export default function AuditEventCreateForm(props: AuditEventCreateFormProps): React.ReactElement;
