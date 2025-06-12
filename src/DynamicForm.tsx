import React, { useState } from "react";
import schemaJson from "./formSchema.json";
import { FormSchema, ComponentSchema } from "./types";
import * as Mui from "@mui/material";
import * as MuiIcons from "@mui/icons-material";

const schema = schemaJson as FormSchema;

function isFieldComponent(component: string): boolean {
  return [
    "TextField",
    "Checkbox",
    "Select",
    "Switch",
    "RadioGroup",
    "Rating",
  ].includes(component);
}

function isMuiIcon(component: string): boolean {
  return Object.prototype.hasOwnProperty.call(MuiIcons, component);
}

function getVisibleFieldsForStep(
  schema: ComponentSchema[],
  step: number,
  allValues: any
) {
  return schema.filter(
    (f) =>
      (f.step ?? 1) === step &&
      (!f.showIf || Boolean(allValues[f.showIf.field]) === f.showIf.equals)
  );
}

function DynamicComponent({
  schema,
  allSchemas,
  idx,
  step,
  allValues,
  values,
  setValues,
  errors,
  setErrors,
}: {
  schema: ComponentSchema;
  allSchemas: ComponentSchema[];
  idx: number;
  step: number;
  allValues: any;
  values: Record<string, any>;
  setValues: (v: Record<string, any>) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
}) {
  // Conditional logic
  if (schema.showIf) {
    const value = values[schema.showIf.field];
    if (Boolean(value) !== schema.showIf.equals) return null;
  }

  // Divider logic: only show if a visible field follows in this step
  if (schema.component === "Divider") {
    const rest = allSchemas.slice(idx + 1);
    const nextVisible = rest.some(
      (f) =>
        (f.step ?? 1) === step &&
        (!f.showIf || Boolean(allValues[f.showIf.field]) === f.showIf.equals) &&
        f.component !== "Divider"
    );
    if (!nextVisible) return null;
  }

  // ICON SUPPORT: Render MUI icon if component is a valid icon name
  if (isMuiIcon(schema.component)) {
    const IconComponent = (MuiIcons as any)[schema.component];
    if (!IconComponent) return null;
    return (
      <Mui.Box sx={{ mb: 2 }}>
        <IconComponent {...schema.props} />
      </Mui.Box>
    );
  }

  // IMG SUPPORT: Render plain <img>
  if (schema.component === "img") {
    return <img {...schema.props} />;
  }

  // Get the MUI component
  const Component = (Mui as any)[schema.component];
  if (!Component) return null;

  // Prepare props
  const props = { ...schema.props };

  // For fields, handle value, onChange, error, helperText
  if (isFieldComponent(schema.component) && props.name) {
    if (schema.component === "Rating") {
      props.value = values[props.name] ?? null;
      props.onChange = (_event: any, value: number | null) => {
        setValues({ ...values, [props.name]: value });
        setErrors({ ...errors, [props.name]: "" });
      };
    } else {
      props.value =
        values[props.name] ?? (schema.component === "Checkbox" ? false : "");
      props.onChange = (e: any) => {
        let value;
        if (schema.component === "Checkbox") {
          value = e.target.checked;
        } else {
          value = e.target.value;
        }
        setValues({ ...values, [props.name]: value });
        setErrors({ ...errors, [props.name]: "" });
      };
    }
    props.error = !!errors[props.name];
    props.helperText = errors[props.name] || props.helperText;
    if (schema.component === "Checkbox") {
      props.checked = !!values[props.name];
    }
    if (props.name === "phone") {
      props.inputProps = {
        ...props.inputProps,
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 10,
        onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
        },
      };
    }
  }

  // Checkbox: always wrap in FormControlLabel for label
  if (schema.component === "Checkbox") {
    return (
      <Mui.Box sx={{ mb: 2 }}>
        <Mui.FormControlLabel
          control={<Mui.Checkbox {...props} />}
          label={schema.props?.label || ""}
        />
      </Mui.Box>
    );
  }

  // Components with children (ImageList, ImageListItem, etc.)
  if (schema.children && schema.children.length > 0) {
    return (
      <Mui.Box sx={{ mb: 2 }}>
        <Component {...props}>
          {schema.children.map((child) => (
            <DynamicComponent
              key={child.id}
              schema={child}
              allSchemas={schema.children ?? []}
              idx={0}
              step={step}
              allValues={allValues}
              values={values}
              setValues={setValues}
              errors={errors}
              setErrors={setErrors}
            />
          ))}
        </Component>
      </Mui.Box>
    );
  }

  // Typography and Divider: spacing
  if (schema.component === "Typography" || schema.component === "Divider") {
    return <Component {...props} />;
  }

  // All other components: spacing
  return (
    <Mui.Box sx={{ mb: 2 }}>
      <Component {...props} />
    </Mui.Box>
  );
}

const validateField = (schema: ComponentSchema, value: any) => {
  const props = schema.props || {};
  if (
    props.required &&
    (value === "" ||
      value === undefined ||
      value === null ||
      (typeof value === "boolean" && value === false))
  ) {
    return `${props.label || props.name} is required`;
  }
  if (
    props.inputProps &&
    props.inputProps.minLength &&
    value &&
    value.length < props.inputProps.minLength
  ) {
    return `${props.label || props.name} must be at least ${
      props.inputProps.minLength
    } characters`;
  }
  if (
    props.inputProps &&
    props.inputProps.maxLength &&
    value &&
    value.length > props.inputProps.maxLength
  ) {
    return `${props.label || props.name} must be at most ${
      props.inputProps.maxLength
    } characters`;
  }
  if (
    props.type === "email" &&
    value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return "Invalid email address";
  }
  if (props.name === "phone" && value && !/^\d{10}$/.test(value)) {
    return "Phone number must be exactly 10 digits";
  }
  if (
    schema.component === "Rating" &&
    props.required &&
    (value === null || value === undefined || value === 0)
  ) {
    return `${props.label || props.name} is required`;
  }
  if (
    props.inputProps &&
    props.inputProps.pattern &&
    value &&
    !new RegExp(props.inputProps.pattern).test(value)
  ) {
    return `Invalid format`;
  }
  return "";
};

const DynamicForm: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxStep = Math.max(1, ...schema.map((f) => f.step ?? 1));
  const isStepper = maxStep > 1;

  const allValues = values;
  const componentsForStep = getVisibleFieldsForStep(schema, step, allValues);

  // Navigation
  const onNext = () => {
    let newErrors: Record<string, string> = {};
    for (const field of componentsForStep) {
      if (isFieldComponent(field.component) && field.props?.name) {
        const err = validateField(field, values[field.props.name]);
        if (err) newErrors[field.props.name] = err;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setStep((s) => s + 1);
  };
  const onBack = () => setStep((s) => s - 1);

  // Submit
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};
    for (const field of componentsForStep) {
      if (isFieldComponent(field.component) && field.props?.name) {
        const err = validateField(field, values[field.props.name]);
        if (err) newErrors[field.props.name] = err;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setResult(values);
  };

  return (
    <Mui.Paper elevation={2} sx={{ maxWidth: 480, mx: "auto", mt: 6, p: 4 }}>
      <form onSubmit={onSubmit} noValidate>
        {componentsForStep.map((component, idx) => (
          <DynamicComponent
            key={component.id}
            schema={component}
            allSchemas={schema}
            idx={idx}
            step={step}
            allValues={allValues}
            values={values}
            setValues={setValues}
            errors={errors}
            setErrors={setErrors}
          />
        ))}
        <Mui.Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {isStepper && step > 1 && (
            <Mui.Button variant="outlined" color="primary" onClick={onBack}>
              Back
            </Mui.Button>
          )}
          {isStepper && step < maxStep && (
            <Mui.Button
              variant="contained"
              color="primary"
              type="button"
              onClick={onNext}>
              Next
            </Mui.Button>
          )}
          {(!isStepper || step === maxStep) && (
            <Mui.Button type="submit" variant="contained" color="primary">
              Submit
            </Mui.Button>
          )}
        </Mui.Box>
        {result && (
          <Mui.Box sx={{ mt: 3 }}>
            <pre
              style={{ background: "#f4fafd", borderRadius: 7, padding: 14 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Mui.Box>
        )}
      </form>
    </Mui.Paper>
  );
};

export default DynamicForm;
