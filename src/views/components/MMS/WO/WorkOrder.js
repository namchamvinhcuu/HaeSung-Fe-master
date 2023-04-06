import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { WorkOrderDto } from '@models';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { workOrderService } from '@services';
import { addDays, ErrorAlert, SuccessAlert, isValidDate } from '@utils';
import _ from 'lodash';
// import { debounce } from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import WorkOrderDialog from './WorkOrderDialog';
import { useMemo } from 'react';
import ChooseDevicePrintDialog from './ChooseDevicePrintDialog';

const WorkOrder = (props) => {
  const [showPrint, setShowPrint] = useState(false);
  let isRendered = useRef(true);
  const intl = useIntl();
  const initStartDate = new Date();

  // console.log('re-render')

  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      ...WorkOrderDto,
      StartSearchingDate: initStartDate,
      EndSearchingDate: addDays(initStartDate, 30),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [selectedRow, setSelectedRow] = useState({
    ...WorkOrderDto,
  });

  const [newData, setNewData] = useState({ ...WorkOrderDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const toggleDialog = (mode) => {
    // Set mode based on the argument passed
    setMode(mode === CREATE_ACTION ? CREATE_ACTION : UPDATE_ACTION);

    // Toggle the value of isOpenDialog
    setIsOpenDialog(!isOpenDialog);
  };

  const setDisableShowingWO = (startDate) => {
    // Format the start date passed to YYYY-MM-DD
    const itemStartDate = moment(startDate).format('YYYY-MM-DD');

    // Format the initStartDate with a subtract of 7 hours and then format it to YYYY-MM-DD
    const currentDate = moment(initStartDate).add(-7, 'hours').format('YYYY-MM-DD');

    // Return the result of the comparison between itemStartDate and currentDate
    return itemStartDate !== currentDate;
  };

  const showingWO = async (workOrder) => {
    // Show a confirmation window
    if (!window.confirm(intl.formatMessage({ id: 'general.confirm_showing' }))) return;

    try {
      // Get the result from handleShowingWO function
      const res = await workOrderService.handleShowingWO(workOrder);

      // Check the response status code
      const isSuccess = res?.HttpResponseCode === 200;

      // Fetch the data if the status code is success
      if (isSuccess) await fetchData();

      // Show the alert message based on the response status code
      (isSuccess ? SuccessAlert : ErrorAlert)(
        intl.formatMessage({ id: res?.ResponseMessage ?? 'general.system_error' })
      );
    } catch (error) {
      // Log the error
      console.log(error);
    }
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setWorkOrderState({
        ...workOrderState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    // const rowSelected = workOrderState.data.filter(function (item) {
    //   return item.WoId === arrIds[0];
    // });
    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRow({ ...rowSelected[0] });
    // } else {
    //   setSelectedRow({ ...WorkOrderDto });
    // }

    // Filter the data to get the selected row
    const rowSelected = workOrderState.data.find((item) => item.WoId === arrIds[0]);

    setSelectedRow(rowSelected ? { ...rowSelected } : { ...WorkOrderDto });
  };

  // const handleDelete = async (workOrder) => {
  //   if (
  //     window.confirm(
  //       intl.formatMessage({
  //         id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
  //       })
  //     )
  //   ) {
  //     try {
  //       let res = await workOrderService.handleDelete(workOrder);
  //       if (res) {
  //         if (res && res.HttpResponseCode === 200) {
  //           await fetchData();
  //           SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
  //         } else {
  //           ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
  //         }
  //       } else {
  //         ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };
  const handleDelete = async (workOrder) => {
    // Prompt the user to confirm the delete action
    const confirm = window.confirm(
      intl.formatMessage({
        id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
      })
    );

    if (confirm) {
      try {
        // Call the handleDelete method of the workOrderService with the workOrder as a parameter
        const response = await workOrderService.handleDelete(workOrder);

        // If there is a response from the API
        if (response) {
          // If the HTTP response code is 200 (OK)
          if (response.HttpResponseCode === 200) {
            // Fetch the updated data and display a success alert
            await fetchData();
            SuccessAlert(intl.formatMessage({ id: response.ResponseMessage }));
          } else {
            // If the HTTP response code is not 200 (OK), show an error alert
            ErrorAlert(intl.formatMessage({ id: response.ResponseMessage }));
          }
        } else {
          // If there is no response from the API, show a system error alert
          ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        }
      } catch (error) {
        // Log any errors that occur during the API call
        console.log(error);
      }
    }
  };

  const changeSearchData = (e, inputName) => {
    // Destructure the MaterialId and MaterialCode properties from the selected material object, if it exists
    const { MaterialId, MaterialCode } = e || {};

    // Create a new searchData object with updated values
    const newSearchData = {
      ...workOrderState.searchData,
      // Update the corresponding property in the new searchData object
      [inputName]:
        // If inputName is 'MaterialId', use the MaterialId from the selected material object or the default from WorkOrderDto
        inputName === 'MaterialId'
          ? MaterialId || WorkOrderDto.MaterialId
          : // If inputName is 'StartSearchingDate' or 'EndSearchingDate', use the provided date value
          inputName === 'StartSearchingDate' || inputName === 'EndSearchingDate'
          ? e
          : // Otherwise, use the input value
            e.target.value,
      // Use the MaterialCode from the selected material object or the default from WorkOrderDto
      MaterialCode: MaterialCode || WorkOrderDto.MaterialCode,
    };

    // Update the workOrderState with the updated searchData object
    setWorkOrderState({
      ...workOrderState,
      searchData: newSearchData,
    });
  };

  const getSearchMaterialArr = async () => {
    const res = await workOrderService.getSearchMaterialArr(0, 0);
    return res;
  };

  // Function to check if dates are valid
  const checkInvalidDates = (checkObj) => {
    let flag = true;
    let message = 'general.system_error';
    // Loop through each property of the checkObj object
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'StartSearchingDate':
          // Check if the value of StartSearchingDate is valid Date Format
          if (!isValidDate(value)) {
            // Set the message to 'general.StartSearchingDate_invalid'
            message = 'general.StartSearchingDate_invalid';
            // Set flag to false
            flag = false;
          }
          break;
        case 'EndSearchingDate':
          // Check if the value of EndSearchingDate is valid Date Format
          if (!isValidDate(value)) {
            // Set the message to 'general.EndSearchingDate_invalid'
            message = 'general.EndSearchingDate_invalid';
            // Set flag to false
            flag = false;
          }
          break;

        default:
          // If the key does not match the above cases, do nothing
          break;
      }
    });
    // Return the flag and message
    return { flag, message };
  };

  // getWorkOrderData function for retrieving work order data
  const getWorkOrderData = async (params) => {
    // Fetch the work order data from the service
    const res = await workOrderService.get(params);
    // Check if the response exists and the component is rendered
    if (res && isRendered) {
      // Return the data and total row from the response
      return {
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
      };
    }
    // Return an empty data array and total row 0 if the response does not exist or the component is not rendered
    return { data: [], totalRow: 0 };
  };

  const fetchData = async () => {
    // Check if there are invalid dates in the searchData object
    const { flag, message } = checkInvalidDates(workOrderState.searchData);

    // If there are no invalid dates and the component is rendered
    if (flag && isRendered) {
      // Set the isLoading state to true
      setWorkOrderState({
        ...workOrderState,
        isLoading: true,
      });

      // Get the parameters for the get API request
      const params = {
        page: workOrderState.page,
        pageSize: workOrderState.pageSize,
        WoCode: workOrderState.searchData.WoCode.trim(),
        MaterialId: workOrderState.searchData.MaterialId,
        StartSearchingDate: workOrderState.searchData.StartSearchingDate,
        EndSearchingDate: workOrderState.searchData.EndSearchingDate,
        isActived: showActivedData,
      };

      // Get the work order data from the API
      const { data, totalRow } = await getWorkOrderData(params);

      // Set the data and totalRow state
      setWorkOrderState({
        ...workOrderState,
        data,
        totalRow,
        isLoading: false,
      });
    } else {
      // If there are invalid dates or the component is not rendered, show error alert
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  const handlePrint = () => {};

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [workOrderState.page, workOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, WorkOrderDto)) {
      const data = [newData, ...workOrderState.data];
      if (data.length > workOrderState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setWorkOrderState({
          ...workOrderState,
          data: [...data],
          totalRow: workOrderState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, WorkOrderDto)) {
      let newArr = [...workOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.WoId == selectedRow.WoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setWorkOrderState({
        ...workOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.WoId) + 1 + (workOrderState.page - 1) * workOrderState.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 130,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={3}>
              <IconButton
                aria-label="show"
                color="primary"
                size="small"
                sx={[{ '&:hover': { border: '1px solid blue' } }]}
                disabled={params.row.IsShowing || !params.row.LineId || setDisableShowingWO(params.row.StartDate)}
                onClick={() => {
                  showingWO(params.row);
                }}
              >
                {params.row.IsShowing ? (
                  <VisibilityIcon fontSize="inherit" />
                ) : (
                  <VisibilityOffIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
            <Grid item xs={3}>
              <IconButton
                aria-label="print"
                size="small"
                sx={[{ '&:hover': { border: '1px solid #9c27b0' }, color: '#9c27b0' }]}
                onClick={togglePrint}
              >
                <LocalPrintshopIcon fontSize="inherit" />
              </IconButton>
            </Grid>
            <Grid item xs={3}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => {
                  toggleDialog(UPDATE_ACTION);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>

            <Grid item xs={3}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // {
    //   field: 'WoCode',
    //   headerName: intl.formatMessage({ id: 'work_order.WoCode' }),
    //   /*flex: 0.7,*/ width: 200,
    // },
    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'work_order.MaterialCode' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'BomVersion',
      headerName: intl.formatMessage({ id: 'work_order.BomVersion' }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: 'FPoMasterCode',
      headerName: intl.formatMessage({ id: 'work_order.FPoMasterCode' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'LineName',
      headerName: intl.formatMessage({ id: 'forecast.LineName' }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: 'WOProcess',
      headerName: 'Process',
      /*flex: 0.7,*/ width: 120,
      renderCell: (params) => {
        return <span>{params.row.WOProcess === false ? 'Inject' : 'Assy'}</span>;
      },
    },
    {
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'work_order.OrderQty' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'HMIQty',
      headerName: 'HMI Qty',
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'ActualQty',
      headerName: intl.formatMessage({ id: 'work_order.ActualQty' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'NGQty',
      headerName: 'NG Qty',
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'StartDate',
      headerName: intl.formatMessage({ id: 'work_order.StartDate' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          // return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD');
          return moment(params?.value).format('YYYY-MM-DD');
        }
      },
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

  const togglePrint = () => {
    setShowPrint(!showPrint);
  };
  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}>
          <MuiButton
            text="create"
            color="success"
            onClick={() => {
              toggleDialog(CREATE_ACTION);
            }}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="work_order.WoCode"
            name="WoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'WoCode')}
          />
        </Grid>

        <Grid item xs>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'work_order.MaterialCode' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            value={
              workOrderState.searchData.MaterialId !== 0
                ? {
                    MaterialId: workOrderState.searchData.MaterialId,
                    MaterialCode: workOrderState.searchData.MaterialCode,
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
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={workOrderState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={workOrderState.searchData.EndSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'EndSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>

            <Grid item>
              <FormControlLabel
                sx={{ mb: 0, ml: '1px' }}
                control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                label={showActivedData ? 'Actived' : 'Deleted'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={workOrderState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={workOrderState.data}
        page={workOrderState.page - 1}
        pageSize={workOrderState.pageSize}
        rowCount={workOrderState.totalRow}
        onPageChange={(newPage) => {
          setWorkOrderState({ ...workOrderState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.WoId}
        onSelectionModelChange={(newSelectedRowId) => handleRowSelection(newSelectedRowId)}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <WorkOrderDialog
        setNewData={setNewData}
        setUpdateData={setSelectedRow}
        initModal={mode === CREATE_ACTION ? WorkOrderDto : selectedRow}
        isOpen={isOpenDialog}
        onClose={toggleDialog}
        mode={mode}
        fetchData={fetchData}
      />
      <ChooseDevicePrintDialog isOpen={showPrint} onClose={togglePrint} dataPrint={selectedRow} />
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrder);
