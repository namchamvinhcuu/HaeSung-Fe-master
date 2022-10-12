import * as React from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function MuiDateField({ label, value, onChange, sx, variant, margin, error, helperText, disabled }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        disabled={disabled}
        label={label}
        value={value ? value : null}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            fullWidth
            size='small'
            sx={sx}
            margin={margin}
            variant={variant}
            {...params}
            error={error}
            helperText={helperText}
          />
        )}
      />
    </LocalizationProvider>
  );
}

