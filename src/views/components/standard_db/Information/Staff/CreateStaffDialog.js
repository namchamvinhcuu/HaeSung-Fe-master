import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiButton } from '@controls';
import { Alert, Box, Grid, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React, { useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { ExcelRenderer } from 'react-excel-renderer';
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
  const refFile = useRef();
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
    setRowsExcel(null);
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
    if (!movies) {
      ErrorAlert('Chưa chọn file update');
      // fetchData();
      //return false;
      //handleCloseDialog();
    } else {
      setDialogState({ ...dialogState, isSubmit: true });
      readXlsxFile(movies, { schema }).then(({ rows, errors }) => {
        handleSubmitFile(rows);
      });
      document.getElementById('excelinput').text = '';
      setRowsExcel(null);
      refFile.current.value = '';
      refFile.current.text = '';
      setDialogState({ ...dialogState, isSubmit: false });
    }
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

  const [movies, setMovies] = useState(null);
  const [rowsExcel, setRowsExcel] = useState([]);
  // const changeHandler = ($event) => {
  //   const files = $event.target.files;
  //   if (files.length) {
  //     const file = files[0];
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       console.log(event)
  //         const wb = event.target.result;
  //         const sheets = wb.SheetNames;
  //         if (sheets.length) {
  //             const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
  //             setMovies(rows)
  //         }
  //     }
  //     reader.readAsArrayBuffer(file);
  // }
  // };

  const changeHandler = (event) => {
    const files = event.target.files[0];
    setMovies(files);
    ExcelRenderer(files, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        setRowsExcel(resp.rows.splice(1, resp.rows.length));
      }
    });
  };

  const [value, setValue] = React.useState('tab1');
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <MuiDialog
      maxWidth="md"
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
          <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={6} sx={{ p: 3 }}>
              <input type="file" name="file" id="excelinput" required onChange={changeHandler} ref={refFile} />
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={12}>
              <div className="row">
                <div className="col-sm-12 mt-2">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">STT</th>
                        <th scope="col">Staff Code</th>
                        <th scope="col">Staff Name</th>
                        <th scope="col">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <OutTable data={rowsExcel} columns={columnExcel} tableClassName="ExcelTable" tableHeaderRowClass="heading" /> */}
                      {rowsExcel?.length ? (
                        rowsExcel.map((value, index) => (
                          <tr key={index}>
                            <th scope="row">{index + 1}</th>
                            <td>{value[0]}</td>
                            <td>{value[1]}</td>
                            <td>{value[2]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Grid>
          </Grid>
        </TabPanel>
      </TabContext>
    </MuiDialog>
  );
};

export default CreateStaffDialog;
