import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';

import { useIntl } from 'react-intl';
const MuiSearchField = React.forwardRef((props, ref) => {
  const intl = useIntl();
  const { label, name, type, value, disabled, onClick, onChange } = props;

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const keyPress = (e) => {
    if (e.key === 'Enter') {
      // console.log('value', e.target.value);
      onClick();
    }
  };

  return (
    // <FormControl sx={{ mb: 0.5, width: "100%" }} disabled={disabled} variant="standard">
    //   <InputLabel>{intl.formatMessage({ id: label })}</InputLabel>
    //   <Input
    //     // sx={{ pb: "3px" }}
    //     type={type || "text"}
    //     name={name}
    //     onKeyDown={keyPress}
    //     onChange={onChange}
    //   // endAdornment={
    //   //     <InputAdornment position="end">
    //   //         <IconButton
    //   //             aria-label={intl.formatMessage({ id: 'general.search' })}
    //   //             onMouseDown={handleMouseDown}
    //   //             onClick={onClick}
    //   //         >
    //   //             <SearchIcon />
    //   //         </IconButton>
    //   //     </InputAdornment>
    //   // }
    //   />
    // </FormControl>

    <TextField
      sx={{ paddingBottom: '4px' }}
      inputRef={ref}
      fullWidth
      type={type ?? 'text'}
      size="small"
      variant="standard"
      label={intl.formatMessage({ id: label })}
      disabled={disabled ?? false}
      name={name}
      value={value}
      onChange={onChange}
      onKeyDown={keyPress}
    />
  );
});

export default MuiSearchField;
