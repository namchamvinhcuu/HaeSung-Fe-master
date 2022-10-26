import * as React from "react";
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";

export default function MuiSelectField({
  value,
  options,
  displayLabel,
  displayValue,
  displayGroup,
  onChange,
  // onOpen,
  defaultValue,
  sx,
  margin,
  disabled,
  label,
  error,
  helperText,
  variant,
  required,
}) {
  let labelFomart = label;
  if (required) labelFomart += " *";

  // const foo = () => {};

  return !displayGroup ? (
    <Autocomplete
      fullWidth
      disabled={disabled}
      size="small"
      margin={margin}
      options={options}
      value={value}
      autoHighlight
      openOnFocus
      getOptionLabel={(option) => option[displayLabel]}
      isOptionEqualToValue={(option, value) =>
        option[displayValue] === value[displayValue]
      }
      defaultValue={defaultValue ?? null}
      onChange={onChange}
      // onOpen={onOpen ?? foo}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            sx={sx ?? { mb: 0.5 }}
            variant={variant}
            label={labelFomart}
            error={error}
            helperText={helperText}
          />
        );
      }}
    />
  ) : (
    <Autocomplete
      fullWidth
      disabled={disabled}
      size="small"
      margin={margin}
      options={options}
      value={value}
      autoHighlight
      openOnFocus
      groupBy={(option) => option[displayGroup]}
      getOptionLabel={(option) => option[displayLabel]}
      isOptionEqualToValue={(option, value) =>
        option[displayValue] === value[displayValue]
      }
      defaultValue={defaultValue ?? null}
      onChange={onChange}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            sx={sx ?? { mb: 0.5 }}
            variant={variant}
            label={labelFomart}
            error={error}
            helperText={helperText}
          />
        );
      }}
      renderGroup={(params) => {
        return (
          <div key={"group" + params.key}>
            <div
              style={{
                textIndent: "10px",
                marginBottom: 10,
                background: "#0288d1",
              }}
            >
              <span style={{ fontSize: 14, color: "white" }}>
                {params.group}
              </span>
            </div>
            <div style={{ textIndent: "15px", marginBottom: 10 }}>
              {params.children}
            </div>
          </div>
        );
      }}
    />
  );
}
