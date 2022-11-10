import React from "react";
import TextField from "@mui/material/TextField";

const MuiTextField = React.forwardRef((props, ref) => {
  const {
    label,
    type,
    name,
    value,
    autoFocus,
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
      inputRef={ref}
      type={type ?? "text"}
      size="small"
      label={labelFormat}
      disabled={disabled}
      autoFocus={autoFocus ?? false}
      name={name}
      value={value}
      onChange={onChange}
      error={error ?? false}
      helperText={helperText ?? ""}
      {...props}
    />
  );
});

export default MuiTextField;
