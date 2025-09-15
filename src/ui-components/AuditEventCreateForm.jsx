/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createAuditEvent } from "../graphql/mutations";
const client = generateClient();
export default function AuditEventCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    timestamp: "",
    userId: "",
    action: "",
    resourceId: "",
    details: "",
    transactionHash: "",
    merkleRoot: "",
    batchId: "",
    severity: "",
    category: "",
    outcome: "",
    ipAddress: "",
    userAgent: "",
    sessionId: "",
  };
  const [timestamp, setTimestamp] = React.useState(initialValues.timestamp);
  const [userId, setUserId] = React.useState(initialValues.userId);
  const [action, setAction] = React.useState(initialValues.action);
  const [resourceId, setResourceId] = React.useState(initialValues.resourceId);
  const [details, setDetails] = React.useState(initialValues.details);
  const [transactionHash, setTransactionHash] = React.useState(
    initialValues.transactionHash
  );
  const [merkleRoot, setMerkleRoot] = React.useState(initialValues.merkleRoot);
  const [batchId, setBatchId] = React.useState(initialValues.batchId);
  const [severity, setSeverity] = React.useState(initialValues.severity);
  const [category, setCategory] = React.useState(initialValues.category);
  const [outcome, setOutcome] = React.useState(initialValues.outcome);
  const [ipAddress, setIpAddress] = React.useState(initialValues.ipAddress);
  const [userAgent, setUserAgent] = React.useState(initialValues.userAgent);
  const [sessionId, setSessionId] = React.useState(initialValues.sessionId);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setTimestamp(initialValues.timestamp);
    setUserId(initialValues.userId);
    setAction(initialValues.action);
    setResourceId(initialValues.resourceId);
    setDetails(initialValues.details);
    setTransactionHash(initialValues.transactionHash);
    setMerkleRoot(initialValues.merkleRoot);
    setBatchId(initialValues.batchId);
    setSeverity(initialValues.severity);
    setCategory(initialValues.category);
    setOutcome(initialValues.outcome);
    setIpAddress(initialValues.ipAddress);
    setUserAgent(initialValues.userAgent);
    setSessionId(initialValues.sessionId);
    setErrors({});
  };
  const validations = {
    timestamp: [{ type: "Required" }],
    userId: [{ type: "Required" }],
    action: [{ type: "Required" }],
    resourceId: [{ type: "Required" }],
    details: [{ type: "Required" }, { type: "JSON" }],
    transactionHash: [],
    merkleRoot: [],
    batchId: [],
    severity: [{ type: "Required" }],
    category: [{ type: "Required" }],
    outcome: [{ type: "Required" }],
    ipAddress: [],
    userAgent: [],
    sessionId: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          timestamp,
          userId,
          action,
          resourceId,
          details,
          transactionHash,
          merkleRoot,
          batchId,
          severity,
          category,
          outcome,
          ipAddress,
          userAgent,
          sessionId,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createAuditEvent.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "AuditEventCreateForm")}
      {...rest}
    >
      <TextField
        label="Timestamp"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={timestamp && convertToLocal(new Date(timestamp))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              timestamp: value,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.timestamp ?? value;
          }
          if (errors.timestamp?.hasError) {
            runValidationTasks("timestamp", value);
          }
          setTimestamp(value);
        }}
        onBlur={() => runValidationTasks("timestamp", timestamp)}
        errorMessage={errors.timestamp?.errorMessage}
        hasError={errors.timestamp?.hasError}
        {...getOverrideProps(overrides, "timestamp")}
      ></TextField>
      <TextField
        label="User id"
        isRequired={true}
        isReadOnly={false}
        value={userId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId: value,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.userId ?? value;
          }
          if (errors.userId?.hasError) {
            runValidationTasks("userId", value);
          }
          setUserId(value);
        }}
        onBlur={() => runValidationTasks("userId", userId)}
        errorMessage={errors.userId?.errorMessage}
        hasError={errors.userId?.hasError}
        {...getOverrideProps(overrides, "userId")}
      ></TextField>
      <TextField
        label="Action"
        isRequired={true}
        isReadOnly={false}
        value={action}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action: value,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.action ?? value;
          }
          if (errors.action?.hasError) {
            runValidationTasks("action", value);
          }
          setAction(value);
        }}
        onBlur={() => runValidationTasks("action", action)}
        errorMessage={errors.action?.errorMessage}
        hasError={errors.action?.hasError}
        {...getOverrideProps(overrides, "action")}
      ></TextField>
      <TextField
        label="Resource id"
        isRequired={true}
        isReadOnly={false}
        value={resourceId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId: value,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.resourceId ?? value;
          }
          if (errors.resourceId?.hasError) {
            runValidationTasks("resourceId", value);
          }
          setResourceId(value);
        }}
        onBlur={() => runValidationTasks("resourceId", resourceId)}
        errorMessage={errors.resourceId?.errorMessage}
        hasError={errors.resourceId?.hasError}
        {...getOverrideProps(overrides, "resourceId")}
      ></TextField>
      <TextAreaField
        label="Details"
        isRequired={true}
        isReadOnly={false}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details: value,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.details ?? value;
          }
          if (errors.details?.hasError) {
            runValidationTasks("details", value);
          }
          setDetails(value);
        }}
        onBlur={() => runValidationTasks("details", details)}
        errorMessage={errors.details?.errorMessage}
        hasError={errors.details?.hasError}
        {...getOverrideProps(overrides, "details")}
      ></TextAreaField>
      <TextField
        label="Transaction hash"
        isRequired={false}
        isReadOnly={false}
        value={transactionHash}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash: value,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.transactionHash ?? value;
          }
          if (errors.transactionHash?.hasError) {
            runValidationTasks("transactionHash", value);
          }
          setTransactionHash(value);
        }}
        onBlur={() => runValidationTasks("transactionHash", transactionHash)}
        errorMessage={errors.transactionHash?.errorMessage}
        hasError={errors.transactionHash?.hasError}
        {...getOverrideProps(overrides, "transactionHash")}
      ></TextField>
      <TextField
        label="Merkle root"
        isRequired={false}
        isReadOnly={false}
        value={merkleRoot}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot: value,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.merkleRoot ?? value;
          }
          if (errors.merkleRoot?.hasError) {
            runValidationTasks("merkleRoot", value);
          }
          setMerkleRoot(value);
        }}
        onBlur={() => runValidationTasks("merkleRoot", merkleRoot)}
        errorMessage={errors.merkleRoot?.errorMessage}
        hasError={errors.merkleRoot?.hasError}
        {...getOverrideProps(overrides, "merkleRoot")}
      ></TextField>
      <TextField
        label="Batch id"
        isRequired={false}
        isReadOnly={false}
        value={batchId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId: value,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.batchId ?? value;
          }
          if (errors.batchId?.hasError) {
            runValidationTasks("batchId", value);
          }
          setBatchId(value);
        }}
        onBlur={() => runValidationTasks("batchId", batchId)}
        errorMessage={errors.batchId?.errorMessage}
        hasError={errors.batchId?.hasError}
        {...getOverrideProps(overrides, "batchId")}
      ></TextField>
      <TextField
        label="Severity"
        isRequired={true}
        isReadOnly={false}
        value={severity}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity: value,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.severity ?? value;
          }
          if (errors.severity?.hasError) {
            runValidationTasks("severity", value);
          }
          setSeverity(value);
        }}
        onBlur={() => runValidationTasks("severity", severity)}
        errorMessage={errors.severity?.errorMessage}
        hasError={errors.severity?.hasError}
        {...getOverrideProps(overrides, "severity")}
      ></TextField>
      <TextField
        label="Category"
        isRequired={true}
        isReadOnly={false}
        value={category}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category: value,
              outcome,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.category ?? value;
          }
          if (errors.category?.hasError) {
            runValidationTasks("category", value);
          }
          setCategory(value);
        }}
        onBlur={() => runValidationTasks("category", category)}
        errorMessage={errors.category?.errorMessage}
        hasError={errors.category?.hasError}
        {...getOverrideProps(overrides, "category")}
      ></TextField>
      <TextField
        label="Outcome"
        isRequired={true}
        isReadOnly={false}
        value={outcome}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome: value,
              ipAddress,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.outcome ?? value;
          }
          if (errors.outcome?.hasError) {
            runValidationTasks("outcome", value);
          }
          setOutcome(value);
        }}
        onBlur={() => runValidationTasks("outcome", outcome)}
        errorMessage={errors.outcome?.errorMessage}
        hasError={errors.outcome?.hasError}
        {...getOverrideProps(overrides, "outcome")}
      ></TextField>
      <TextField
        label="Ip address"
        isRequired={false}
        isReadOnly={false}
        value={ipAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress: value,
              userAgent,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.ipAddress ?? value;
          }
          if (errors.ipAddress?.hasError) {
            runValidationTasks("ipAddress", value);
          }
          setIpAddress(value);
        }}
        onBlur={() => runValidationTasks("ipAddress", ipAddress)}
        errorMessage={errors.ipAddress?.errorMessage}
        hasError={errors.ipAddress?.hasError}
        {...getOverrideProps(overrides, "ipAddress")}
      ></TextField>
      <TextField
        label="User agent"
        isRequired={false}
        isReadOnly={false}
        value={userAgent}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent: value,
              sessionId,
            };
            const result = onChange(modelFields);
            value = result?.userAgent ?? value;
          }
          if (errors.userAgent?.hasError) {
            runValidationTasks("userAgent", value);
          }
          setUserAgent(value);
        }}
        onBlur={() => runValidationTasks("userAgent", userAgent)}
        errorMessage={errors.userAgent?.errorMessage}
        hasError={errors.userAgent?.hasError}
        {...getOverrideProps(overrides, "userAgent")}
      ></TextField>
      <TextField
        label="Session id"
        isRequired={false}
        isReadOnly={false}
        value={sessionId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              userId,
              action,
              resourceId,
              details,
              transactionHash,
              merkleRoot,
              batchId,
              severity,
              category,
              outcome,
              ipAddress,
              userAgent,
              sessionId: value,
            };
            const result = onChange(modelFields);
            value = result?.sessionId ?? value;
          }
          if (errors.sessionId?.hasError) {
            runValidationTasks("sessionId", value);
          }
          setSessionId(value);
        }}
        onBlur={() => runValidationTasks("sessionId", sessionId)}
        errorMessage={errors.sessionId?.errorMessage}
        hasError={errors.sessionId?.hasError}
        {...getOverrideProps(overrides, "sessionId")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
