import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField, MuiAutocomplete, MuiButton } from '@controls';
import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Box, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { locationService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import readXlsxFile from 'read-excel-file';
import { BASE_URL } from '@constants/ConfigConstants';

const CreateLocationDialog = (props) => {
  const intl = useIntl();

  const { initModal, isOpen, onClose, setNewData, valueOption, fetchData } = props;
  // const [AreaList, setAreaList] = useState([]);
  const getArea = async () => {
    const res = await locationService.GetArea();
    return res;
    // if (res.HttpResponseCode === 200 && res.Data) {
    //     setAreaList([...res.Data])
    // }
    // else {
    //     setAreaList([])
    // }
  };
  // useEffect(() => {
  //     if (isOpen)
  //     // getArea();
  // }, [isOpen])

  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schemaY = yup.object().shape({
    LocationCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    AreaId: yup
      .number()
      .min(1, intl.formatMessage({ id: 'general.field_required' }))
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schemaY,
    initialValues: { ...initModal },
    onSubmit: async (values) => {
      const res = await locationService.createLocation(values);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        //handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    },
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };

  const [value, setValue] = React.useState('tab1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataReadFile, setDataReadFile] = useState([]);
  const refFile = useRef();

  const schema = {
    'LOCATION CODE': {
      prop: 'LocationCode',
      type: String,
      required: true,
    },
    'AREA CODE': {
      prop: 'AreaCode',
      type: String,
      required: true,
    },
  };
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);

    // if (event.target.files[0]?.name !== 'Aisle.xlsx') {
    //   ErrorAlert(intl.formatMessage({ id: 'Files.Aisle' }));
    // }

    readXlsxFile(event.target.files[0]).then(function (data) {
      setDataReadFile(data);
    });
  };

  const handleSubmitFile = async (rows) => {
    const res = await locationService.createLocationByExcel(rows);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      fetchData();
      handleCloseDialog();
    } else {
      if (res.HttpResponseCode === 400 && res.ResponseMessage === 'general.duplicated_code') {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
      if (res.HttpResponseCode === 400 && res.ResponseMessage === '') {
        ErrorAlert(intl.formatMessage({ id: 'Files.Data_Invalid' }));
      }
    }
  };

  const handleUpload = async () => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (!selectedFile) {
      ErrorAlert('Chưa chọn file update');
    }

    readXlsxFile(selectedFile, { schema }).then(({ rows, errors }) => {
      errors.length === 0;

      handleSubmitFile(rows);
    });

    // document.getElementById('upload-excel').value = '';
    document.getElementById('upload-excel-product').text = '';
    setSelectedFile(null);
    refFile.current.value = '';
    refFile.current.text = '';
    setDataReadFile([]);
    setDialogState({ ...dialogState, isSubmit: false });
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
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
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
                      label={intl.formatMessage({ id: 'location.LocationCode' }) + ' *'}
                      name="LocationCode"
                      value={values.LocationCode}
                      onChange={handleChange}
                      error={touched.LocationCode && Boolean(errors.LocationCode)}
                      helperText={touched.LocationCode && errors.LocationCode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MuiAutocomplete
                      label={intl.formatMessage({ id: 'location.AreaId' }) + ' *'}
                      fetchDataFunc={getArea}
                      displayLabel="commonDetailName"
                      displayValue="commonDetailId"
                      value={
                        values.AreaId ? { commonDetailId: values.AreaId, commonDetailName: values.AreaName } : null
                      }
                      disabled={dialogState.isSubmit}
                      onChange={(e, value) => {
                        setFieldValue('AreaName', value?.commonDetailName || '');
                        setFieldValue('AreaId', value?.commonDetailId || '');
                      }}
                      error={touched.AreaId && Boolean(errors.AreaId)}
                      helperText={touched.AreaId && errors.AreaId}
                      variant="outlined"
                    />
                    {/* <MuiSelectField
                                    value={values.AreaId ? { commonDetailId: values.AreaId, commonDetailName: values.AreaName } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'location.AreaId' }) + ' *'}
                                    options={AreaList}
                                    displayLabel="commonDetailName"
                                    displayValue="commonDetailId"
                                    onChange={(e, value) => {
                                    setFieldValue("AreaName", value?.commonDetailName || '');
                                    setFieldValue("AreaId", value?.commonDetailId || "");
                                }}
                                    error={touched.AreaId && Boolean(errors.AreaId)}
                                    helperText={touched.AreaId && errors.AreaId}
                                /> */}
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
              <input type="file" name="file" onChange={changeHandler} id="upload-excel-product" ref={refFile} />
            </Grid>
            <Grid item xs={12}>
              <Grid container direction="row-reverse">
                <MuiButton
                  text="upload"
                  color="success"
                  onClick={handleUpload}
                  disabled={selectedFile ? false : true}
                />
                <MuiButton
                  text="excel"
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `${BASE_URL}/TemplateImport/Aisle.xlsx`;
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  {dataReadFile[0] && <th scope="col">STT</th>}
                  {dataReadFile[0]?.map((item, index) => {
                    return (
                      <th key={`TITLE ${index}`} scope="col">
                        {item}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {dataReadFile?.slice(1).length > 0 ? (
                  dataReadFile?.slice(1)?.map((item, index) => {
                    return (
                      <tr key={`ITEM${index}`}>
                        <td scope="col">{index + 1}</td>
                        {item?.map((data, index) => {
                          return (
                            <td key={`DATA${index}`} scope="col">
                              {data}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="100" className="text-center">
                      <i className="fa fa-database" aria-hidden="true" style={{ fontSize: '35px', opacity: 0.6 }} />
                      <h3 style={{ opacity: 0.6, marginTop: '5px' }}>No Data</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </TabPanel>
      </TabContext>
    </MuiDialog>
  );
};

export default CreateLocationDialog;
