import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import React, { useState } from "react";

import { useIntl } from "react-intl";
const MuiSearchField = (props) => {
  const intl = useIntl();
  const { label, name, onClick, onChange } = props;

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const keyPress = (e) => {
    if (e.key === "Enter") {
      // console.log('value', e.target.value);
      onClick();
    }
  };

  return (
    <FormControl sx={{ mb: 0.5, width: "100%" }} variant="standard">
      <InputLabel>{intl.formatMessage({ id: label })}</InputLabel>
      <Input
        type="text"
        name={name}
        onKeyDown={keyPress}
        onChange={onChange}
        // endAdornment={
        //     <InputAdornment position="end">
        //         <IconButton
        //             aria-label={intl.formatMessage({ id: 'general.search' })}
        //             onMouseDown={handleMouseDown}
        //             onClick={onClick}
        //         >
        //             <SearchIcon />
        //         </IconButton>
        //     </InputAdornment>
        // }
      />
    </FormControl>
  );
};

export default MuiSearchField;
