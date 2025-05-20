/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getAuditBatch } from "../graphql/queries";
import { updateAuditBatch } from "../graphql/mutations";
const client = generateClient();
export default function AuditBatchUpdateForm(props) {
  const {
    id: idProp,
    auditBatch: auditBatchModelProp,
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
    merkleRoot: "",
    transactionHash: "",
  };
  const [timestamp, setTimestamp] = React.useState(initialValues.timestamp);
  const [merkleRoot, setMerkleRoot] = React.useState(initialValues.merkleRoot);
  const [transactionHash, setTransactionHash] = React.useState(
    initialValues.transactionHash
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = auditBatchRecord
      ? { ...initialValues, ...auditBatchRecord }
      : initialValues;
    setTimestamp(cleanValues.timestamp);
    setMerkleRoot(cleanValues.merkleRoot);
    setTransactionHash(cleanValues.transactionHash);
    setErrors({});
  };
  const [auditBatchRecord, setAuditBatchRecord] =
    React.useState(auditBatchModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getAuditBatch.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getAuditBatch
        : auditBatchModelProp;
      setAuditBatchRecord(record);
    };
    queryData();
  }, [idProp, auditBatchModelProp]);
  React.useEffect(resetStateValues, [auditBatchRecord]);
  const validations = {
    timestamp: [{ type: "Required" }],
    merkleRoot: [{ type: "Required" }],
    transactionHash: [{ type: "Required" }],
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
          merkleRoot,
          transactionHash,
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
            query: updateAuditBatch.replaceAll("__typename", ""),
            variables: {
              input: {
                id: auditBatchRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "AuditBatchUpdateForm")}
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
              merkleRoot,
              transactionHash,
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
        label="Merkle root"
        isRequired={true}
        isReadOnly={false}
        value={merkleRoot}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              merkleRoot: value,
              transactionHash,
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
        label="Transaction hash"
        isRequired={true}
        isReadOnly={false}
        value={transactionHash}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              timestamp,
              merkleRoot,
              transactionHash: value,
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
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || auditBatchModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || auditBatchModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
