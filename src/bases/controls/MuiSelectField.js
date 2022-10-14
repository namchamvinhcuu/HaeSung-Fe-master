import * as React from 'react';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';

export default function MuiSelectField({ value, options, displayLabel, displayValue, onChange, defaultValue, sx, margin, disabled, label, error, helperText, variant }) {
  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      size='small'
      margin={margin}
      options={options}
      value={value}
      autoHighlight
      openOnFocus
      getOptionLabel={option => option[displayLabel]}
      isOptionEqualToValue={(option, value) => option[displayValue] === value[displayValue]}
      defaultValue={defaultValue ?? null}
      onChange={onChange}
      renderInput={(params) => {
        return <TextField
          {...params}
          sx={sx}
          variant={variant}
          label={label}
          error={error}
          helperText={helperText}
        />
      }}
    />
  );
}

