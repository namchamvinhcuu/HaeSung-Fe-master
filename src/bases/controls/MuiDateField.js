import * as React from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';

export default function MuiDateField({
  label,
  value,
  onChange,
  onBlur,
  sx,
  variant,
  margin,
  error,
  helperText,
  disabled,
  required,
}) {
  let labelFomart = label;
  if (required) labelFomart += ' *';

  const onKeyDown = (e) => {
    e.preventDefault();
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        disabled={disabled}
        label={labelFomart}
        value={value ? value : null}
        onChange={(e) => onChange(e != null ? moment(e).format('YYYY-MM-DDT00:00:00') : null)}
        onBlur={onBlur}
        inputFormat="yyyy-MM-dd"
        renderInput={(params) => (
          <TextField
            fullWidth
            size="small"
            sx={{ ...sx, mb: 0.5 }}
            // onKeyDown={onKeyDown}
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
