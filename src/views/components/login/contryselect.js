import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function CountrySelect({ onChange }) {
  return (
    <Autocomplete
      id="country-select-demo"
      sx={{ mt: 1 }}
      options={countries}
      autoHighlight
      onChange={onChange}

      defaultValue={countries[0]}
      getOptionLabel={(option) => option.label}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <img

            width="20"
            src={`https://flagcdn.com/w20/${option.fcode.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${option.fcode.toLowerCase()}.png 2x`}
            alt=""
          />
          {option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField

          {...params}
          label="Select a language"
          sx={{ backgroundColor: '#E8F0FE' }}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries = [
  {
    code: 'en-US',
    label: 'English',
    phone: '1',
    fcode: 'US',
    suggested: true,
  },
  { code: 'zh-CN', fcode: 'CN', label: 'China', phone: '86' },
  { code: 'vi-VN', fcode: 'VN', label: 'Vietnam', phone: '84' },
];
