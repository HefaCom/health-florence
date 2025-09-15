/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { AuditBatch } from "../API.ts";
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
export declare type AuditBatchUpdateFormInputValues = {
    timestamp?: string;
    merkleRoot?: string;
    transactionHash?: string;
    status?: string;
};
export declare type AuditBatchUpdateFormValidationValues = {
    timestamp?: ValidationFunction<string>;
    merkleRoot?: ValidationFunction<string>;
    transactionHash?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuditBatchUpdateFormOverridesProps = {
    AuditBatchUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    timestamp?: PrimitiveOverrideProps<TextFieldProps>;
    merkleRoot?: PrimitiveOverrideProps<TextFieldProps>;
    transactionHash?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuditBatchUpdateFormProps = React.PropsWithChildren<{
    overrides?: AuditBatchUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    auditBatch?: AuditBatch;
    onSubmit?: (fields: AuditBatchUpdateFormInputValues) => AuditBatchUpdateFormInputValues;
    onSuccess?: (fields: AuditBatchUpdateFormInputValues) => void;
    onError?: (fields: AuditBatchUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuditBatchUpdateFormInputValues) => AuditBatchUpdateFormInputValues;
    onValidate?: AuditBatchUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AuditBatchUpdateForm(props: AuditBatchUpdateFormProps): React.ReactElement;
