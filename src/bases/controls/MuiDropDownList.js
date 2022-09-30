import React, { useEffect } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Box from "@mui/material/Box"
import { axios } from '@utils'

const MuiDropDownList = ({ url, placeholder, onChange, defaultValue, sx, variantInput, disabled,
    required, error, helperText, value, groupBy, renderGroup, renderOption }) => {

    const [open, setOpen] = React.useState(false);
    const [complete_getdata, setComplete_getdata] = React.useState(false);

    const [options, setOptions] = React.useState([]);


    const loading = open && !complete_getdata && options.length === 0;

    useEffect(() => {
        let active = true;

        if (!loading) {

            return undefined;
        }

        (async () => {
            //lấy dữ liệu từ server
            // await sleep(1e3); // For demo purposes.

            let dataOptions = await axios.get(url);
            setComplete_getdata(true)
            if (active) {
                setOptions(dataOptions);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);

    useEffect(() => {
        if (!open) {
            setOptions([]);
        } else {
            setComplete_getdata(false)
        }
    }, [open]);

    return (
        <Autocomplete

            sx={sx}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            onChange={(event, newValue) => {
                onChange && newValue && onChange(newValue)
            }}
            onInputChange={(event, newInputValue) => {

                if (!newInputValue)
                    onChange && onChange({ title: '', value: '' })
            }}

            defaultValue={defaultValue && defaultValue.title && defaultValue.value !== undefined ? defaultValue : null}
            value={value}
            isOptionEqualToValue={(option, value) => option.title === value.title}
            getOptionLabel={(option) => option.title ?? ''}
            options={options}
            loading={loading}
            disabled={disabled}
            groupBy={groupBy}
            renderGroup={renderGroup}
            renderOption={(props, option) => renderOption ? renderOption(props, option) : (
                <Box component="li" {...props} key={option.value}>
                    {option.title}
                </Box>
            )}


            renderInput={(params) => (
                <TextField
                    {...params}
                    required={required}
                    label={placeholder}
                    variant={variantInput}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    )
}

export default MuiDropDownList