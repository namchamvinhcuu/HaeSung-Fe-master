import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import { ForecastPODto } from '@models';
import { FormControlLabel, Switch, Tooltip, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { fixedPOService } from '@services';
import { ErrorAlert, getCurrentWeek, isNumber, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';

const FixedPO = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();

  const [fixedPOState, setFixedPOState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      ...ForecastPODto,
      Year: new Date().getFullYear(),
      Week: getCurrentWeek(),
    },
  });

  const [disableChangeOrderQty, setDisableChangeOrderQty] = useState(true);

  const [newData, setNewData] = useState({ ...ForecastPODto });
  const [selectedRow, setSelectedRow] = useState({
    ...ForecastPODto,
  });

  const [showActivedData, setShowActivedData] = useState(true);

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setFixedPOState({
        ...fixedPOState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    // const rowSelected = fixedPOState.data.filter(function (item) {
    //   return item.FPOId === arrIds[0];
    // });

    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRow({ ...rowSelected[0] });
    // } else {
    //   setSelectedRow({ ...ForecastPODto });
    // }
    const rowSelected = fixedPOState.data.find((item) => item.FPOId === arrIds[0]);
    setSelectedRow(rowSelected ? { ...rowSelected } : { ...ForecastPODto });
  };

  // const changeSearchData = (e, inputName) => {
  //   let newSearchData = { ...fixedPOState.searchData };

  //   switch (inputName) {
  //     case 'MaterialId':
  //       newSearchData[inputName] = e ? e.MaterialId : ForecastPODto.MaterialId;
  //       newSearchData['MaterialCode'] = e ? e.MaterialCode : ForecastPODto.MaterialCode;
  //       break;

  //     default:
  //       newSearchData[inputName] = parseInt(e.target.value, 10);
  //       break;
  //   }
  //   setFixedPOState({
  //     ...fixedPOState,
  //     searchData: { ...newSearchData },
  //   });
  // };

  const changeSearchData = (e, inputName) => {
    // Create a new object `newSearchData` that is a shallow copy of the `fixedPOState.searchData` object
    let newSearchData = { ...fixedPOState.searchData };

    // Check the inputName and update the corresponding field in the `newSearchData` object
    switch (inputName) {
      case 'MaterialId':
        // If `e` is truthy, update `MaterialId` and `MaterialCode` to its respective values.
        // If `e` is falsy, update `MaterialId` and `MaterialCode` to their default values in the `ForecastPODto` object.
        newSearchData[inputName] = e ? e.MaterialId : ForecastPODto.MaterialId;
        newSearchData['MaterialCode'] = e ? e.MaterialCode : ForecastPODto.MaterialCode;
        break;

      // For other input names, update the field with the integer value of the `e.target.value`
      default:
        newSearchData[inputName] = parseInt(e.target.value, 10);
        break;
    }

    // Update the `fixedPOState` with the updated `newSearchData` object
    setFixedPOState({
      ...fixedPOState,
      searchData: { ...newSearchData },
    });
  };

  const getSearchMaterialArr = async () => {
    const res = await fixedPOService.getSearchMaterialArr();
    return res;
  };

  // const handleRowUpdate = async (newRow) => {
  //   if (!isNumber(newRow.OrderQty) || newRow.OrderQty < 0) {
  //     ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
  //     return selectedRow;
  //   }
  //   newRow = { ...newRow, OrderQty: parseInt(newRow.OrderQty) };
  //   const res = await fixedPOService.modify(newRow);
  //   if (res && res.HttpResponseCode === 200 && isRendered) {
  //     SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
  //     setSelectedRow(res.Data);
  //     return res.Data;
  //   } else {
  //     ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
  //     return selectedRow;
  //   }
  // };
  const handleRowUpdate = async (newRow) => {
    // Check if the type of `newRow.OrderQty` is not a number or if it is less than 0
    if (!isNumber(newRow.OrderQty) || newRow.OrderQty < 0) {
      // Show an error alert with the message `forecast.OrderQty_required_bigger`
      ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
      // Return the current selected row
      return selectedRow;
    }
    // Convert the `newRow.OrderQty` to an integer
    newRow.OrderQty = parseInt(newRow.OrderQty);
    // Call the `fixedPOService.modify` function with the updated `newRow` object
    const res = await fixedPOService.modify(newRow);
    // If the response is truthy, the `HttpResponseCode` is 200, and the component is rendered
    if (res && res.HttpResponseCode === 200) {
      // Show a success alert with the message from the `ResponseMessage` field of the response object
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      // Update the selected row with the `Data` field from the response object
      setSelectedRow(res.Data);
      // Return the updated selected row
      return res.Data;
    } else {
      // If the response is falsy or the `HttpResponseCode` is not 200, show an error alert with the message from the `ResponseMessage` field of the response object
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      // Return the current selected row
      return selectedRow;
    }
  };

  const handleProcessRowUpdateError = React.useCallback((error) => {
    ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  }, []);

  // const fetchData = async () => {
  //   let flag = true;
  //   let message = '';
  //   const checkObj = { ...fixedPOState.searchData };
  //   _.forOwn(checkObj, (value, key) => {
  //     switch (key) {
  //       case 'Year':
  //         if (!Number.isInteger(value) || value < 2022 || value > 2050) {
  //           message = 'general.year_invalid';
  //           flag = false;
  //         }
  //         break;
  //       case 'Week':
  //         if (!isNumber(value) || value < 1 || value > 52) {
  //           message = 'general.week_invalid';
  //           flag = false;
  //         }
  //         break;

  //       default:
  //         break;
  //     }
  //   });

  //   if (flag && isRendered) {
  //     setFixedPOState({
  //       ...fixedPOState,
  //       isLoading: true,
  //     });

  //     const params = {
  //       page: fixedPOState.page,
  //       pageSize: fixedPOState.pageSize,
  //       MaterialId: fixedPOState.searchData.MaterialId,
  //       Year: fixedPOState.searchData.Year,
  //       Week: fixedPOState.searchData.Week,
  //       isActived: showActivedData,
  //     };

  //     const res = await fixedPOService.get(params);

  //     if (res && isRendered)
  //       setFixedPOState({
  //         ...fixedPOState,
  //         data: !res.Data ? [] : [...res.Data],
  //         totalRow: res.TotalRow,
  //         isLoading: false,
  //       });
  //   } else {
  //     ErrorAlert(intl.formatMessage({ id: message }));
  //   }
  // };

  const isValidTimeSearchData = () => {
    let flag = true;
    let message = '';
    const checkObj = { ...fixedPOState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'Year':
          if (!Number.isInteger(value) || value < 2022 || value > 2050) {
            message = 'general.year_invalid';
            flag = false;
          }
          break;
        case 'Week':
          if (!isNumber(value) || value < 1 || value > 52) {
            message = 'general.week_invalid';
            flag = false;
          }
          break;
        default:
          break;
      }
    });

    if (!flag) {
      ErrorAlert(intl.formatMessage({ id: message }));
    }

    return flag;
  };

  const fetchData = _.debounce(async () => {
    if (isValidTimeSearchData() && isRendered) {
      setFixedPOState({
        ...fixedPOState,
        isLoading: true,
      });

      const params = {
        page: fixedPOState.page,
        pageSize: fixedPOState.pageSize,
        MaterialId: fixedPOState.searchData.MaterialId,
        Year: fixedPOState.searchData.Year,
        Week: fixedPOState.searchData.Week,
        isActived: showActivedData,
      };

      const res = await fixedPOService.get(params);

      if (res && isRendered)
        setFixedPOState({
          ...fixedPOState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    }
  }, 200);

  // const fetchData = async () => {
  //   // Check the searchData fields to ensure their validity before making the API call
  //   let flag = true;
  //   let message = '';
  //   const checkObj = { ...fixedPOState.searchData };
  //   _.forOwn(checkObj, (value, key) => {
  //     switch (key) {
  //       case 'Year':
  //         if (!Number.isInteger(value) || value < 2022 || value > 2050) {
  //           message = 'general.year_invalid';
  //           flag = false;
  //         }
  //         break;
  //       case 'Week':
  //         if (!isNumber(value) || value < 1 || value > 52) {
  //           message = 'general.week_invalid';
  //           flag = false;
  //         }
  //         break;
  //       // Add more cases for other fields as needed
  //       default:
  //         break;
  //     }
  //   });
  //   // If the fields are valid, make the API call
  //   if (flag && isRendered) {
  //     // Set isLoading to true to indicate the start of loading data
  //     setFixedPOState({
  //       ...fixedPOState,
  //       isLoading: true,
  //     });

  //     // Prepare the parameters for the API call
  //     const params = {
  //       page: fixedPOState.page,
  //       pageSize: fixedPOState.pageSize,
  //       MaterialId: fixedPOState.searchData.MaterialId,
  //       Year: fixedPOState.searchData.Year,
  //       Week: fixedPOState.searchData.Week,
  //       isActived: showActivedData,
  //     };

  //     // Make the API call
  //     const res = await fixedPOService.get(params);

  //     // If the API call was successful, update the state with the response data
  //     if (res && isRendered)
  //       setFixedPOState({
  //         ...fixedPOState,
  //         data: !res.Data ? [] : [...res.Data],
  //         totalRow: res.TotalRow,
  //         isLoading: false,
  //       });
  //   } else {
  //     // If the fields are not valid, display an error message
  //     ErrorAlert(intl.formatMessage({ id: message }));
  //   }
  // };

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [fixedPOState.page, fixedPOState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, ForecastPODto)) {
      let newArr = [...fixedPOState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FPOId == selectedRow.FPOId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setFixedPOState({
        ...fixedPOState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: 'FPOId', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FPOId) + 1 + (fixedPOState.page - 1) * fixedPOState.pageSize,
    },
    {
      field: 'LineName',
      headerName: intl.formatMessage({ id: 'forecast.LineName' }),
      width: 200,
    },
    {
      field: 'FPoMasterCode',
      headerName: intl.formatMessage({ id: 'forecast.FPoMasterCode' }),
      type: 'number',
      width: 140,
    },
    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'delivery_order.MaterialCode' }),
      width: 150,
    },

    {
      field: 'DescriptionMaterial',
      headerName: intl.formatMessage({ id: 'general.description' }),
      width: 300,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.DescriptionMaterial ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14 }}>{params.row.DescriptionMaterial}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'Amount',
      headerName: intl.formatMessage({ id: 'forecast.Amount' }),
      width: 150,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },
    {
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'forecast.OrderQty' }),
      width: 150,
      editable: true,
      renderCell: (params) => {
        return (
          <TextField
            variant="standard"
            fullWidth
            disabled={disableChangeOrderQty}
            value={params.row.OrderQty ?? 0}
            inputProps={{
              onDoubleClick: () => {
                setDisableChangeOrderQty(false);
              },
            }}
          />
        );
      },
    },
    {
      field: 'Week',
      headerName: intl.formatMessage({ id: 'forecast.Week' }),
      width: 100,
    },
    {
      field: 'Year',
      headerName: intl.formatMessage({ id: 'forecast.Year' }),
      width: 100,
    },

    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.created_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modified_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={1} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={4} sm={3} md={2}>
          <MuiSearchField
            label="forecast.Year"
            type="number"
            name="Year"
            value={fixedPOState.searchData.Year}
            defaultValue={new Date().getFullYear()}
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'Year')}
          />
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <MuiSearchField
            label="forecast.Week"
            type="number"
            name="Week"
            value={fixedPOState.searchData.Week}
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'Week')}
            defaultValue={fixedPOState.searchData.Week}
          />
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'forecast.MaterialId' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            value={
              fixedPOState.searchData.MaterialId !== 0
                ? {
                  MaterialId: fixedPOState.searchData.MaterialId,
                  MaterialCode: fixedPOState.searchData.MaterialCode,
                }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, 'MaterialId');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mb: 0, ml: '1px' }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
            label={intl.formatMessage({ id: showActivedData ? 'general.data_actived' : 'general.data_deleted' })}
          />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={fixedPOState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // gridHeight={740}
        columns={columns}
        rows={fixedPOState.data}
        page={fixedPOState.page - 1}
        pageSize={fixedPOState.pageSize}
        rowCount={fixedPOState.totalRow}
        onPageChange={(newPage) => setFixedPOState({ ...fixedPOState, page: newPage + 1 })}
        getRowId={(rows) => rows.FPOId}
        onSelectionModelChange={(newSelectedRowId) => handleRowSelection(newSelectedRowId)}
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        getCellClassName={(params) => {
          if (params.field === 'OrderQty' && params.value && params.value > 0) {
            return 'hot';
          }
          return '';
        }}
        initialState={{
          pinnedColumns: { left: ['id', 'LineName', 'FPoMasterCode', 'MaterialCode'], right: ['action'] },
        }}
      />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  return { language };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(FixedPO);
