import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { FGSOMasterDto } from '@models';
import { FormControlLabel, Grid, Switch } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { fgSOService } from '@services';
import { addDays, ErrorAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FGSODetail from '../ShippingOrder/FGSODetail';

const FGPicking = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const [FGsoId, setFGsoId] = useState(null);
  const [fgSOState, setfgSOState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...FGSOMasterDto,
      EndSearchingDate: addDays(new Date(), 7),
    },
  });

  // const [mode, setMode] = useState(CREATE_ACTION);

  // const [newData, setNewData] = useState({ ...FGSOMasterDto });

  const [showActivedData, setShowActivedData] = useState(true);

  const [selectedRow, setSelectedRow] = useState({
    ...FGSOMasterDto,
  });

  // const toggleDialog = (mode) => {
  //     if (mode === CREATE_ACTION) {
  //         setMode(CREATE_ACTION);
  //     } else {
  //         setMode(UPDATE_ACTION);
  //     }
  //     setIsOpenDialog(!isOpenDialog);
  // };

  const changeSearchData = async (e, inputName) => {
    let newSearchData = { ...fgSOState.searchData };

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

    setfgSOState({
      ...fgSOState,
      searchData: { ...newSearchData },
    });
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setfgSOState({
        ...fgSOState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = fgSOState.data.filter(function (item) {
      return item.FGsoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...FGSOMasterDto });
    }
  };

  const fetchData = async () => {
    setFGsoId(null);
    let flag = true;
    let message = '';
    const checkObj = { ...fgSOState.searchData };
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
      setfgSOState({
        ...fgSOState,
        isLoading: true,
      });

      const params = {
        page: fgSOState.page,
        pageSize: fgSOState.pageSize,
        FGsoCodeSearch: fgSOState.searchData.FGsoCodeSearch,
        StartSearchingDate: fgSOState.searchData.StartSearchingDate,
        EndSearchingDate: fgSOState.searchData.EndSearchingDate,
        isActived: showActivedData,
      };

      const res = await fgSOService.getFGSOMasters(params);

      if (res && isRendered)
        setfgSOState({
          ...fgSOState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  const columns = [
    // { field: 'FGsoId', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.FGsoId) + 1 + (fgSOState.page - 1) * fgSOState.pageSize,
    },
    {
      field: 'FGsoId',
      headerName: 'FG SO Code',
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'FGsoStatus',
      headerName: intl.formatMessage({ id: 'material-so-master.MsoStatus' }),
      /*flex: 0.7,*/ width: 120,
      align: 'center',
      renderCell: (params) => {
        return params.row.FGsoStatus ? (
          <span className="badge badge-success" style={{ fontSize: '13px' }}>
            {intl.formatMessage({ id: 'material-so-master.MsoStatus_true' })}
          </span>
        ) : (
          <span className="badge badge-danger" style={{ fontSize: '13px' }}>
            {intl.formatMessage({ id: 'material-so-master.MsoStatus_false' })}
          </span>
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
  }, [fgSOState.page, fgSOState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, FGSOMasterDto)) {
      let newArr = [...fgSOState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FGsoId == selectedRow.FGsoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setfgSOState({
        ...fgSOState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);
  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}>
          {/* <MuiButton
                        text="create"
                        color="success"
                        onClick={() => {
                            toggleDialog(CREATE_ACTION);
                        }}
                    /> */}
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="material-so-master.MsoCode"
            name="FGsoCodeSearch"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'FGsoCodeSearch')}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={fgSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={fgSOState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={fgSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={fgSOState.searchData.EndSearchingDate}
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
        showLoading={fgSOState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={columns}
        rows={fgSOState.data}
        page={fgSOState.page - 1}
        pageSize={fgSOState.pageSize}
        rowCount={fgSOState.totalRow}
        onPageChange={(newPage) => {
          setfgSOState({ ...fgSOState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.FGsoId}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
          setFGsoId(newSelectedRowId[0]);
        }}
        // getRowClassName={(params) => {
        //     if (_.isEqual(params.row, newData)) {
        //         return `Mui-created`;
        //     }
        // }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      {/* <MaterialSODialog
                setNewData={setNewData}
                setUpdateData={setSelectedRow}
                initModal={mode === CREATE_ACTION ? FGSOMasterDto : selectedRow}
                isOpen={isOpenDialog}
                onClose={toggleDialog}
                mode={mode}
            /> */}

      <FGSODetail FGsoId={FGsoId} fromPicking={true} />
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

export default connect(mapStateToProps, mapDispatchToProps)(FGPicking);
