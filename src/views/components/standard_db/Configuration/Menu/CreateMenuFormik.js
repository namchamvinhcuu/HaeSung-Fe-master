import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  FormLabel,
} from "@mui/material";

import { MuiDialog, MuiResetButton, MuiSubmitButton } from "@controls";
import { ErrorAlert, SuccessAlert } from "@utils";
import { menuService } from "@services";

const CreateMenuFormik = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);

  const { initModal, isOpen, onClose, setNewData } = props;

  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });

  const [parentMenuArr, setParentMenuArr] = useState([]);
  const clearParent = useRef(null);

  const getParentMenus = async (menuLevel) => {
    const res = await menuService.getParentMenus(menuLevel);
    if (res && isRendered)
      if (res.HttpResponseCode === 200 && res.Data) {
        setParentMenuArr([...res.Data]);
      } else {
        setParentMenuArr([]);
      }
  };

  const schema = yup.object().shape({
    menuName: yup
      .string()
      .required(intl.formatMessage({ id: "menu.menuName_required" })),

    // menuIcon: yup.string().required(intl.formatMessage({ id: 'menu.menuName_required' })),

    navigateUrl: yup.string().when("menuLevel", (menuLevel) => {
      if (parseInt(menuLevel) === 3) {
        return yup
          .string()
          .required(intl.formatMessage({ id: "menu.navigateUrl_required" }));
      }
    }),

    menuComponent: yup
      .string()
      .when("menuLevel", (menuLevel) => {
        if (parseInt(menuLevel) === 3) {
          return yup
            .string()
            .required(
              intl.formatMessage({ id: "menu.menuComponent_required" })
            );
        }
      })
      .when("navigateUrl", (navigateUrl) => {
        if (navigateUrl && navigateUrl.length > 0) {
          return yup
            .string()
            .required(intl.formatMessage({ id: "menu.navigateUrl_required" }));
        }
      }),

    menuLevel: yup.number().required(),

    parentId: yup
      .string()
      .nullable()
      .when("menuLevel", (menuLevel) => {
        if (parseInt(menuLevel) > 1) {
          return yup
            .number()
            .required()
            .min(1, intl.formatMessage({ id: "menu.parentId_required" }))
            .typeError(intl.formatMessage({ id: "menu.parentId_required" }));
        }
      }),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: { ...initModal },
    onSubmit: async (values) => {
      // console.log(values)
      const res = await menuService.createMenu(values);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    },
  });

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    setFieldValue,
    errors,
    touched,
    isValid,
    resetForm,
  } = formik;

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };

  const handleReset = () => {
    const ele = clearParent.current.getElementsByClassName(
      "MuiAutocomplete-clearIndicator"
    )[0];
    if (ele) ele.click();
    resetForm();
  };

  useEffect(() => {
    if (isOpen) getParentMenus(values.menuLevel);

    return () => {
      isRendered = false;
    };
  }, [isOpen, values.menuLevel]);

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: "general.create" })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid
          container
          rowSpacing={2.5}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid
                item
                xs={6}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <span
                  style={{
                    marginTop: "5px",
                    marginRight: "16px",
                    fontWeight: "700",
                  }}
                >
                  {intl.formatMessage({ id: "general.level" })}
                </span>

                <FormControl>
                  <RadioGroup
                    row
                    name="menuLevel"
                    value={values.menuLevel}
                    onChange={(event) => {
                      setFieldValue("menuLevel", event.target.value);
                      const ele = clearParent.current.getElementsByClassName(
                        "MuiAutocomplete-clearIndicator"
                      )[0];
                      if (ele) ele.click();
                    }}
                  >
                    <FormControlLabel
                      label="1"
                      value={1}
                      control={<Radio size="small" />}
                    />
                    <FormControlLabel
                      label="2"
                      value={2}
                      control={<Radio size="small" />}
                    />
                    <FormControlLabel
                      label="3"
                      value={3}
                      control={<Radio size="small" />}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                {values.menuLevel > 1 && (
                  <Autocomplete
                    ref={clearParent}
                    options={parentMenuArr}
                    getOptionLabel={(menuP) => menuP?.menuName}
                    onChange={(e, value) =>
                      setFieldValue("parentId", value?.menuId || "")
                    }
                    onOpen={handleBlur}
                    includeInputInList
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        label="Parent"
                        name="parentId"
                        variant="outlined"
                        error={Boolean(errors.parentId)}
                        helperText={errors.parentId}
                      />
                    )}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "general.name" })}
                  name="menuName"
                  value={values.menuName}
                  onChange={handleChange}
                  error={Boolean(touched.menuName && errors.menuName)}
                  helperText={touched.menuName && errors.menuName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "general.icon" })}
                  name="menuIcon"
                  value={values.menuIcon}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "general.component" })}
                  name="menuComponent"
                  value={values.menuComponent}
                  onChange={handleChange}
                  error={!!errors?.menuComponent}
                  helperText={errors?.menuComponent}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "general.url" })}
                  name="navigateUrl"
                  value={values.navigateUrl}
                  onChange={handleChange}
                  error={!!errors?.navigateUrl}
                  helperText={errors?.navigateUrl}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: "general.language_key" })}
                  name="languageKey"
                  value={values.languageKey}
                  onChange={handleChange}
                  error={!!errors?.languageKey}
                  helperText={errors?.languageKey}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  checked={values.forRoot}
                  onChange={() => setFieldValue("forRoot", !values.forRoot)}
                  control={<Checkbox />}
                  label="For Root"
                />

                <FormControlLabel
                  checked={values.forApp}
                  onChange={() => setFieldValue("forApp", !values.forApp)}
                  control={<Checkbox />}
                  label="For App"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton
                onClick={handleReset}
                disabled={dialogState.isSubmit}
              />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default CreateMenuFormik;
