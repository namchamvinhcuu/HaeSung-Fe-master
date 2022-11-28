import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { Box, Grid, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

import { staffService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const CreateStaffDialog = (props) => {
  const intl = useIntl();

  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption, fetchData } = props;
  const [selectedFile, setSelectedFile] = useState(null);

  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schemaError = yup.object().shape({
    StaffCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    StaffName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schemaError,
    initialValues: { ...initModal },
    onSubmit: async (values) => {
      const res = await staffService.createStaff(values);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        //handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    setSelectedFile(null);
    onClose();
  };
  const schema = {
    'STAFF CODE': {
      prop: 'StaffCode',
      type: String,
      required: true,
    },
    'STAFF NAME': {
      prop: 'StaffName',
      required: true,
      type: String,
    },
    CONTACT: {
      prop: 'Contact',
      type: String,
    },
  };

  const handleUpload = async () => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (!selectedFile) {
      ErrorAlert('Chưa chọn file update');
      return ;
    }

    readXlsxFile(selectedFile, { schema }).then(({ rows, errors }) => {
      errors.length === 0;
      // console.log(rows);
      handleSubmitFile(rows);
    });
    document.getElementById('excelinput').text = '';

    setSelectedFile(null);
    setDialogState({ ...dialogState, isSubmit: false });
  };

  const handleSubmitFile = async (rows) => {
    const res = await staffService.createStaffByExcel(rows);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const [value, setValue] = React.useState('tab1');
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.create' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <TabContext value={value ?? 'tab1'}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab}>
            <Tab label="Single" value="tab1" />
            <Tab label="Excel" value="tab2" />
          </TabList>
        </Box>
        <TabPanel value="tab1">
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}>
                <Grid container item spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'staff.StaffCode' }) + ' *'}
                      name="StaffCode"
                      //inputProps={{ maxLength: 11 }}
                      value={values.StaffCode}
                      onChange={handleChange}
                      error={touched.StaffCode && Boolean(errors.StaffCode)}
                      helperText={touched.StaffCode && errors.StaffCode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'staff.StaffName' }) + ' *'}
                      name="StaffName"
                      value={values.StaffName}
                      onChange={handleChange}
                      error={touched.StaffName && Boolean(errors.StaffName)}
                      helperText={touched.StaffName && errors.StaffName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline={true}
                      rows={3}
                      disabled={dialogState.isSubmit}
                      label={intl.formatMessage({ id: 'staff.Contact' })}
                      name="Contact"
                      value={values.Contact}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container direction="row-reverse">
                  <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
                  <MuiResetButton onClick={resetForm} disabled={dialogState.isSubmit} />
                </Grid>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        <TabPanel value="tab2">
          <Grid>
            <Grid item xs={12} sx={{ p: 3 }}>
              <input type="file" name="file" id="excelinput" onChange={changeHandler} />
            </Grid>
            <Grid item xs={12}>
              <Grid container direction="row-reverse">
                <MuiButton text="upload" color="success" onClick={handleUpload} />
                <MuiButton
                  text="excel"
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `${BASE_URL}/TemplateImport/Staff.xlsx`;
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
    </MuiDialog>
  );
};

export default CreateStaffDialog;
