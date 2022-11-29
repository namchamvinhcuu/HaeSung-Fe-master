import React from 'react';
import TextField from '@mui/material/TextField';

import { debounce } from 'lodash';

const MuiTextField = React.forwardRef((props, ref) => {
  const { label, type, name, value, autoFocus, required, disabled, onChange, onBlur, error, helperText } = props;
  let labelFormat = label;
  if (required) labelFormat += ' *';
  return (
    <TextField
      fullWidth
      inputRef={ref}
      type={type ?? 'text'}
      size="small"
      label={labelFormat}
      disabled={disabled}
      autoFocus={autoFocus ?? false}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error ?? false}
      helperText={helperText ?? ''}
      {...props}
    />
  );
});

export default MuiTextField;
