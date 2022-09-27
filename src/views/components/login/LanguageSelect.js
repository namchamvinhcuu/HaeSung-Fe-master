import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormattedMessage } from 'react-intl'

export default function LanguageSelect({ onChange, language }) {

  return (
    <Autocomplete
      sx={{ mt: 1 }}
      options={countries}
      autoHighlight
      onChange={onChange}

      defaultValue={language === "VI" ? countries[1] : countries[0]}
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
          label={<FormattedMessage id="general.select_language" />}
          sx={{ backgroundColor: '#E8F0FE' }}
          inputProps={{
            ...params.inputProps
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
    fcode: 'EN',
    label: 'English',
  },
  {
    code: 'vi-VN'
    , fcode: 'VN'
    , label: 'Tiếng Việt'
  },
];
