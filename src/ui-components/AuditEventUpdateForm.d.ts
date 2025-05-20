/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { AuditEvent } from "../API.ts";
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
export declare type AuditEventUpdateFormInputValues = {
    timestamp?: string;
    userId?: string;
    action?: string;
    resourceId?: string;
    details?: string;
    transactionHash?: string;
    merkleRoot?: string;
    batchId?: string;
};
export declare type AuditEventUpdateFormValidationValues = {
    timestamp?: ValidationFunction<string>;
    userId?: ValidationFunction<string>;
    action?: ValidationFunction<string>;
    resourceId?: ValidationFunction<string>;
    details?: ValidationFunction<string>;
    transactionHash?: ValidationFunction<string>;
    merkleRoot?: ValidationFunction<string>;
    batchId?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuditEventUpdateFormOverridesProps = {
    AuditEventUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    timestamp?: PrimitiveOverrideProps<TextFieldProps>;
    userId?: PrimitiveOverrideProps<TextFieldProps>;
    action?: PrimitiveOverrideProps<TextFieldProps>;
    resourceId?: PrimitiveOverrideProps<TextFieldProps>;
    details?: PrimitiveOverrideProps<TextAreaFieldProps>;
    transactionHash?: PrimitiveOverrideProps<TextFieldProps>;
    merkleRoot?: PrimitiveOverrideProps<TextFieldProps>;
    batchId?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuditEventUpdateFormProps = React.PropsWithChildren<{
    overrides?: AuditEventUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    auditEvent?: AuditEvent;
    onSubmit?: (fields: AuditEventUpdateFormInputValues) => AuditEventUpdateFormInputValues;
    onSuccess?: (fields: AuditEventUpdateFormInputValues) => void;
    onError?: (fields: AuditEventUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuditEventUpdateFormInputValues) => AuditEventUpdateFormInputValues;
    onValidate?: AuditEventUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AuditEventUpdateForm(props: AuditEventUpdateFormProps): React.ReactElement;
