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
  required,
}) {
  let labelFormat = label;
  if (required) labelFormat += " *";
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        disabled={disabled}
        label={labelFormat}
        value={value ? value : null}
        onChange={onChange}
        inputFormat="yyyy-MM-dd HH:mm"
        renderInput={(params) => (
          <TextField
            fullWidth
            size="small"
            sx={sx ?? { mb: 0.5 }}
            margin={margin}
            variant={variant ?? "outlined"}
            {...params}
            error={error}
            helperText={helperText}
          />
        )}
      />
    </LocalizationProvider>
  );
}
