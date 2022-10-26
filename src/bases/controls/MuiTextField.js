import React from "react";
import TextField from "@mui/material/TextField";

const MuiTextField = (props) => {
  const {
    label,
    type,
    name,
    value,
    required,
    disabled,
    onChange,
    error,
    helperText,
  } = props;
  let labelFormat = label;
  if (required) labelFormat += " *";
  return (
    <TextField
      fullWidth
      type={type ?? "text"}
      size="small"
      label={labelFormat}
      disabled={disabled}
      name={name}
      value={value}
      onChange={onChange}
      error={error ?? false}
      helperText={helperText ?? ""}
    />
  );
};

export default MuiTextField;
