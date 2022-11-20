import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';

import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';

import { MaterialSOMasterDto } from '@models';
import { materialSOService } from '@services';

import { MaterialSODetail, MaterialSODialog } from '@components';

const MaterialSO = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const [MsoId, setMsoId] = useState(null);
  const [MsoStatus, setMsoStatus] = useState(false);
  const [materialSOState, setMaterialSOState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...MaterialSOMasterDto,
      EndSearchingDate: addDays(new Date(), 7),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [newData, setNewData] = useState({ ...MaterialSOMasterDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const [selectedRow, setSelectedRow] = useState({
    ...MaterialSOMasterDto,
  });

  const toggleDialog = (mode) => {
    if (mode === CREATE_ACTION) {
      setMode(CREATE_ACTION);
    } else {
      setMode(UPDATE_ACTION);
    }
    setIsOpenDialog(!isOpenDialog);
  };

  const changeSearchData = async (e, inputName) => {
    let newSearchData = { ...materialSOState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case 'StartSearchingDate':
      case 'EndSearchingDate':
        newSearchData[inputName] = e;
        break;
      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setMaterialSOState({
      ...materialSOState,
      searchData: { ...newSearchData },
    });
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setMaterialSOState({
        ...materialSOState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = materialSOState.data.filter(function (item) {
      return item.MsoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...MaterialSOMasterDto });
    }
  };

  const handleDelete = async (materialSOMaster) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await materialSOService.deleteMsoMaster({
          MsoId: materialSOMaster.MsoId,
          row_version: materialSOMaster.row_version,
        });
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            SuccessAlert(intl.formatMessage({ id: 'general.success' }));
            await fetchData();
            // setMsoId(null)
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } else {
          ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchData = async () => {
    setMsoId(null);
    let flag = true;
    let message = '';
    const checkObj = { ...materialSOState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'StartSearchingDate':
          if (value == 'Invalid Date') {
            message = 'general.StartSearchingDate_invalid';
            flag = false;
          }
          break;
        case 'EndSearchingDate':
          if (value == 'Invalid Date') {
            message = 'general.EndSearchingDate_invalid';
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag && isRendered) {
      setMaterialSOState({
        ...materialSOState,
        isLoading: true,
      });

      const params = {
        page: materialSOState.page,
        pageSize: materialSOState.pageSize,
        MsoCode: materialSOState.searchData.MsoCode.trim(),
        StartSearchingDate: materialSOState.searchData.StartSearchingDate,
        EndSearchingDate: materialSOState.searchData.EndSearchingDate,
        isActived: showActivedData,
      };

      const res = await materialSOService.getMsoMasters(params);

      if (res && isRendered)
        setMaterialSOState({
          ...materialSOState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  const columns = [
    { field: 'MsoId', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.MsoId) + 1 + (materialSOState.page - 1) * materialSOState.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6}>
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

            <Grid item xs={6}>
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

    {
      field: 'MsoCode',
      headerName: intl.formatMessage({ id: 'material-so-master.MsoCode' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'MsoStatus',
      headerName: intl.formatMessage({ id: 'material-so-master.MsoStatus' }),
      /*flex: 0.7,*/ width: 120,
      renderCell: (params) => {
        return params.row.MsoStatus ? (
          <b style={{ color: 'green' }}>{intl.formatMessage({ id: 'material-so-master.MsoStatus_true' })}</b>
        ) : (
          <b style={{ color: 'red' }}>{intl.formatMessage({ id: 'material-so-master.MsoStatus_false' })}</b>
        );
      },
    },

    {
      field: 'Requester',
      headerName: intl.formatMessage({ id: 'material-so-master.Requester' }),
      /*flex: 0.7,*/ width: 200,
    },

    {
      field: 'DueDate',
      headerName: intl.formatMessage({ id: 'material-so-master.DueDate' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD');
        }
      },
    },

    {
      field: 'Remark',
      headerName: intl.formatMessage({ id: 'material-so-master.Remark' }),
      /*flex: 0.7,*/ width: 400,
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

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [materialSOState.page, materialSOState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, MaterialSOMasterDto)) {
      const data = [newData, ...materialSOState.data];
      if (data.length > materialSOState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setMaterialSOState({
          ...materialSOState,
          data: [...data],
          totalRow: materialSOState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, MaterialSOMasterDto)) {
      let newArr = [...materialSOState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.MsoId == selectedRow.MsoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setMaterialSOState({
        ...materialSOState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

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
            label="material-so-master.MsoCode"
            name="MsoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'MsoCode')}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={materialSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={materialSOState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={materialSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={materialSOState.searchData.EndSearchingDate}
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
        showLoading={materialSOState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={columns}
        rows={materialSOState.data}
        page={materialSOState.page - 1}
        pageSize={materialSOState.pageSize}
        rowCount={materialSOState.totalRow}
        onPageChange={(newPage) => {
          setMaterialSOState({ ...materialSOState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.MsoId}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
          setMsoId(newSelectedRowId[0]);
          var row = materialSOState.data.find((x) => x.MsoId == newSelectedRowId[0]);
          if (row) setMsoStatus(row.MsoStatus);
        }}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <MaterialSODialog
        setNewData={setNewData}
        setUpdateData={setSelectedRow}
        initModal={mode === CREATE_ACTION ? MaterialSOMasterDto : selectedRow}
        isOpen={isOpenDialog}
        onClose={toggleDialog}
        mode={mode}
      />

      <MaterialSODetail MsoId={MsoId} fromPicking={false} MsoStatus={MsoStatus} />
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialSO);
