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
import { getUser } from "../graphql/queries";
import { updateUser } from "../graphql/mutations";
const client = generateClient();
export default function UserUpdateForm(props) {
  const {
    id: idProp,
    user: userModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    role: "",
    createdAt: "",
    updatedAt: "",
  };
  const [email, setEmail] = React.useState(initialValues.email);
  const [firstName, setFirstName] = React.useState(initialValues.firstName);
  const [lastName, setLastName] = React.useState(initialValues.lastName);
  const [phoneNumber, setPhoneNumber] = React.useState(
    initialValues.phoneNumber
  );
  const [dateOfBirth, setDateOfBirth] = React.useState(
    initialValues.dateOfBirth
  );
  const [address, setAddress] = React.useState(initialValues.address);
  const [city, setCity] = React.useState(initialValues.city);
  const [state, setState] = React.useState(initialValues.state);
  const [zipCode, setZipCode] = React.useState(initialValues.zipCode);
  const [emergencyContactName, setEmergencyContactName] = React.useState(
    initialValues.emergencyContactName
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState(
    initialValues.emergencyContactPhone
  );
  const [allergies, setAllergies] = React.useState(initialValues.allergies);
  const [medicalConditions, setMedicalConditions] = React.useState(
    initialValues.medicalConditions
  );
  const [currentMedications, setCurrentMedications] = React.useState(
    initialValues.currentMedications
  );
  const [role, setRole] = React.useState(initialValues.role);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = userRecord
      ? { ...initialValues, ...userRecord }
      : initialValues;
    setEmail(cleanValues.email);
    setFirstName(cleanValues.firstName);
    setLastName(cleanValues.lastName);
    setPhoneNumber(cleanValues.phoneNumber);
    setDateOfBirth(cleanValues.dateOfBirth);
    setAddress(cleanValues.address);
    setCity(cleanValues.city);
    setState(cleanValues.state);
    setZipCode(cleanValues.zipCode);
    setEmergencyContactName(cleanValues.emergencyContactName);
    setEmergencyContactPhone(cleanValues.emergencyContactPhone);
    setAllergies(cleanValues.allergies);
    setMedicalConditions(cleanValues.medicalConditions);
    setCurrentMedications(cleanValues.currentMedications);
    setRole(cleanValues.role);
    setCreatedAt(cleanValues.createdAt);
    setUpdatedAt(cleanValues.updatedAt);
    setErrors({});
  };
  const [userRecord, setUserRecord] = React.useState(userModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getUser.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getUser
        : userModelProp;
      setUserRecord(record);
    };
    queryData();
  }, [idProp, userModelProp]);
  React.useEffect(resetStateValues, [userRecord]);
  const validations = {
    email: [{ type: "Required" }],
    firstName: [{ type: "Required" }],
    lastName: [{ type: "Required" }],
    phoneNumber: [],
    dateOfBirth: [],
    address: [],
    city: [],
    state: [],
    zipCode: [],
    emergencyContactName: [],
    emergencyContactPhone: [],
    allergies: [],
    medicalConditions: [],
    currentMedications: [],
    role: [{ type: "Required" }],
    createdAt: [{ type: "Required" }],
    updatedAt: [{ type: "Required" }],
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
          email,
          firstName,
          lastName,
          phoneNumber: phoneNumber ?? null,
          dateOfBirth: dateOfBirth ?? null,
          address: address ?? null,
          city: city ?? null,
          state: state ?? null,
          zipCode: zipCode ?? null,
          emergencyContactName: emergencyContactName ?? null,
          emergencyContactPhone: emergencyContactPhone ?? null,
          allergies: allergies ?? null,
          medicalConditions: medicalConditions ?? null,
          currentMedications: currentMedications ?? null,
          role,
          createdAt,
          updatedAt,
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
            query: updateUser.replaceAll("__typename", ""),
            variables: {
              input: {
                id: userRecord.id,
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
      {...getOverrideProps(overrides, "UserUpdateForm")}
      {...rest}
    >
      <TextField
        label="Email"
        isRequired={true}
        isReadOnly={false}
        value={email}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email: value,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.email ?? value;
          }
          if (errors.email?.hasError) {
            runValidationTasks("email", value);
          }
          setEmail(value);
        }}
        onBlur={() => runValidationTasks("email", email)}
        errorMessage={errors.email?.errorMessage}
        hasError={errors.email?.hasError}
        {...getOverrideProps(overrides, "email")}
      ></TextField>
      <TextField
        label="First name"
        isRequired={true}
        isReadOnly={false}
        value={firstName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName: value,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.firstName ?? value;
          }
          if (errors.firstName?.hasError) {
            runValidationTasks("firstName", value);
          }
          setFirstName(value);
        }}
        onBlur={() => runValidationTasks("firstName", firstName)}
        errorMessage={errors.firstName?.errorMessage}
        hasError={errors.firstName?.hasError}
        {...getOverrideProps(overrides, "firstName")}
      ></TextField>
      <TextField
        label="Last name"
        isRequired={true}
        isReadOnly={false}
        value={lastName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName: value,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.lastName ?? value;
          }
          if (errors.lastName?.hasError) {
            runValidationTasks("lastName", value);
          }
          setLastName(value);
        }}
        onBlur={() => runValidationTasks("lastName", lastName)}
        errorMessage={errors.lastName?.errorMessage}
        hasError={errors.lastName?.hasError}
        {...getOverrideProps(overrides, "lastName")}
      ></TextField>
      <TextField
        label="Phone number"
        isRequired={false}
        isReadOnly={false}
        value={phoneNumber}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber: value,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.phoneNumber ?? value;
          }
          if (errors.phoneNumber?.hasError) {
            runValidationTasks("phoneNumber", value);
          }
          setPhoneNumber(value);
        }}
        onBlur={() => runValidationTasks("phoneNumber", phoneNumber)}
        errorMessage={errors.phoneNumber?.errorMessage}
        hasError={errors.phoneNumber?.hasError}
        {...getOverrideProps(overrides, "phoneNumber")}
      ></TextField>
      <TextField
        label="Date of birth"
        isRequired={false}
        isReadOnly={false}
        type="date"
        value={dateOfBirth}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth: value,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.dateOfBirth ?? value;
          }
          if (errors.dateOfBirth?.hasError) {
            runValidationTasks("dateOfBirth", value);
          }
          setDateOfBirth(value);
        }}
        onBlur={() => runValidationTasks("dateOfBirth", dateOfBirth)}
        errorMessage={errors.dateOfBirth?.errorMessage}
        hasError={errors.dateOfBirth?.hasError}
        {...getOverrideProps(overrides, "dateOfBirth")}
      ></TextField>
      <TextField
        label="Address"
        isRequired={false}
        isReadOnly={false}
        value={address}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address: value,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.address ?? value;
          }
          if (errors.address?.hasError) {
            runValidationTasks("address", value);
          }
          setAddress(value);
        }}
        onBlur={() => runValidationTasks("address", address)}
        errorMessage={errors.address?.errorMessage}
        hasError={errors.address?.hasError}
        {...getOverrideProps(overrides, "address")}
      ></TextField>
      <TextField
        label="City"
        isRequired={false}
        isReadOnly={false}
        value={city}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city: value,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.city ?? value;
          }
          if (errors.city?.hasError) {
            runValidationTasks("city", value);
          }
          setCity(value);
        }}
        onBlur={() => runValidationTasks("city", city)}
        errorMessage={errors.city?.errorMessage}
        hasError={errors.city?.hasError}
        {...getOverrideProps(overrides, "city")}
      ></TextField>
      <TextField
        label="State"
        isRequired={false}
        isReadOnly={false}
        value={state}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state: value,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.state ?? value;
          }
          if (errors.state?.hasError) {
            runValidationTasks("state", value);
          }
          setState(value);
        }}
        onBlur={() => runValidationTasks("state", state)}
        errorMessage={errors.state?.errorMessage}
        hasError={errors.state?.hasError}
        {...getOverrideProps(overrides, "state")}
      ></TextField>
      <TextField
        label="Zip code"
        isRequired={false}
        isReadOnly={false}
        value={zipCode}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode: value,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.zipCode ?? value;
          }
          if (errors.zipCode?.hasError) {
            runValidationTasks("zipCode", value);
          }
          setZipCode(value);
        }}
        onBlur={() => runValidationTasks("zipCode", zipCode)}
        errorMessage={errors.zipCode?.errorMessage}
        hasError={errors.zipCode?.hasError}
        {...getOverrideProps(overrides, "zipCode")}
      ></TextField>
      <TextField
        label="Emergency contact name"
        isRequired={false}
        isReadOnly={false}
        value={emergencyContactName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName: value,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.emergencyContactName ?? value;
          }
          if (errors.emergencyContactName?.hasError) {
            runValidationTasks("emergencyContactName", value);
          }
          setEmergencyContactName(value);
        }}
        onBlur={() =>
          runValidationTasks("emergencyContactName", emergencyContactName)
        }
        errorMessage={errors.emergencyContactName?.errorMessage}
        hasError={errors.emergencyContactName?.hasError}
        {...getOverrideProps(overrides, "emergencyContactName")}
      ></TextField>
      <TextField
        label="Emergency contact phone"
        isRequired={false}
        isReadOnly={false}
        value={emergencyContactPhone}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone: value,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.emergencyContactPhone ?? value;
          }
          if (errors.emergencyContactPhone?.hasError) {
            runValidationTasks("emergencyContactPhone", value);
          }
          setEmergencyContactPhone(value);
        }}
        onBlur={() =>
          runValidationTasks("emergencyContactPhone", emergencyContactPhone)
        }
        errorMessage={errors.emergencyContactPhone?.errorMessage}
        hasError={errors.emergencyContactPhone?.hasError}
        {...getOverrideProps(overrides, "emergencyContactPhone")}
      ></TextField>
      <TextField
        label="Allergies"
        isRequired={false}
        isReadOnly={false}
        value={allergies}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies: value,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.allergies ?? value;
          }
          if (errors.allergies?.hasError) {
            runValidationTasks("allergies", value);
          }
          setAllergies(value);
        }}
        onBlur={() => runValidationTasks("allergies", allergies)}
        errorMessage={errors.allergies?.errorMessage}
        hasError={errors.allergies?.hasError}
        {...getOverrideProps(overrides, "allergies")}
      ></TextField>
      <TextField
        label="Medical conditions"
        isRequired={false}
        isReadOnly={false}
        value={medicalConditions}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions: value,
              currentMedications,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.medicalConditions ?? value;
          }
          if (errors.medicalConditions?.hasError) {
            runValidationTasks("medicalConditions", value);
          }
          setMedicalConditions(value);
        }}
        onBlur={() =>
          runValidationTasks("medicalConditions", medicalConditions)
        }
        errorMessage={errors.medicalConditions?.errorMessage}
        hasError={errors.medicalConditions?.hasError}
        {...getOverrideProps(overrides, "medicalConditions")}
      ></TextField>
      <TextField
        label="Current medications"
        isRequired={false}
        isReadOnly={false}
        value={currentMedications}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications: value,
              role,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.currentMedications ?? value;
          }
          if (errors.currentMedications?.hasError) {
            runValidationTasks("currentMedications", value);
          }
          setCurrentMedications(value);
        }}
        onBlur={() =>
          runValidationTasks("currentMedications", currentMedications)
        }
        errorMessage={errors.currentMedications?.errorMessage}
        hasError={errors.currentMedications?.hasError}
        {...getOverrideProps(overrides, "currentMedications")}
      ></TextField>
      <TextField
        label="Role"
        isRequired={true}
        isReadOnly={false}
        value={role}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role: value,
              createdAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.role ?? value;
          }
          if (errors.role?.hasError) {
            runValidationTasks("role", value);
          }
          setRole(value);
        }}
        onBlur={() => runValidationTasks("role", role)}
        errorMessage={errors.role?.errorMessage}
        hasError={errors.role?.hasError}
        {...getOverrideProps(overrides, "role")}
      ></TextField>
      <TextField
        label="Created at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={createdAt && convertToLocal(new Date(createdAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt: value,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.createdAt ?? value;
          }
          if (errors.createdAt?.hasError) {
            runValidationTasks("createdAt", value);
          }
          setCreatedAt(value);
        }}
        onBlur={() => runValidationTasks("createdAt", createdAt)}
        errorMessage={errors.createdAt?.errorMessage}
        hasError={errors.createdAt?.hasError}
        {...getOverrideProps(overrides, "createdAt")}
      ></TextField>
      <TextField
        label="Updated at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={updatedAt && convertToLocal(new Date(updatedAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              email,
              firstName,
              lastName,
              phoneNumber,
              dateOfBirth,
              address,
              city,
              state,
              zipCode,
              emergencyContactName,
              emergencyContactPhone,
              allergies,
              medicalConditions,
              currentMedications,
              role,
              createdAt,
              updatedAt: value,
            };
            const result = onChange(modelFields);
            value = result?.updatedAt ?? value;
          }
          if (errors.updatedAt?.hasError) {
            runValidationTasks("updatedAt", value);
          }
          setUpdatedAt(value);
        }}
        onBlur={() => runValidationTasks("updatedAt", updatedAt)}
        errorMessage={errors.updatedAt?.errorMessage}
        hasError={errors.updatedAt?.hasError}
        {...getOverrideProps(overrides, "updatedAt")}
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
          isDisabled={!(idProp || userModelProp)}
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
              !(idProp || userModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
