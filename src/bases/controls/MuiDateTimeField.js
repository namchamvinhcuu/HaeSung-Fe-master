import * as React from "react";
import TextField from "@mui/material/TextField";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function MuiDateTimeField({
  label,
  value,
  onChange,
  sx,
  variant,
  margin,
  error,
  helperText,
  disabled,
}) {
  const onKeyDown = (e) => {
    e.preventDefault();
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        disabled={disabled}
        label={label}
        value={value ? value : null}
        onChange={onChange}
        inputFormat="yyyy-MM-dd HH:mm"
        renderInput={(params) => (
          <TextField
            fullWidth
            size="small"
            sx={sx ?? { mb: 0.5 }}
            // onKeyDown={onKeyDown}
            margin={margin}
            variant={variant ?? "standard"}
            {...params}
            error={error}
            helperText={helperText}
          />
        )}
      />
    </LocalizationProvider>
  );
}
