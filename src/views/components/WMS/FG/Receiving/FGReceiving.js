import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';
import { fgReceivingService } from '@services';
import moment from 'moment';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import { ErrorAlert, SuccessAlert, isNumber } from '@utils';
import { MuiButton, MuiDataGrid, MuiTextField } from '@controls';
import { LotDto } from '@models';

const FGReceiving = (props) => {
  let isRendered = useRef(true);
  const [newData, setNewData] = useState({ ...LotDto });
  const [FGRecevingState, setFGRecevingState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
  });

  const lotInputRef = useRef(null);
  const intl = useIntl();
  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim();
    }
    await handleReceivingLot(inputVal);
    lotInputRef.current.value = '';
    lotInputRef.current.focus();
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const handleReceivingLot = async (inputValue) => {
    const res = await fgReceivingService.scan({ LotId: inputValue });
    if (res && isRendered) {
      if (res.HttpResponseCode === 200 && res.Data) {
        setNewData({ ...res.Data });
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    } else {
      ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
    }
  };
  const fetchData = async () => {
    setFGRecevingState({
      ...FGRecevingState,
      isLoading: true,
    });

    const params = {
      page: FGRecevingState.page,
      pageSize: FGRecevingState.pageSize,
    };

    const res = await fgReceivingService.getAll(params);
    if (res && isRendered)
      setFGRecevingState({
        ...FGRecevingState,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  useEffect(() => {
    fetchData();
    lotInputRef.current.focus();

    return () => {
      isRendered = false;
    };
  }, [FGRecevingState.page, FGRecevingState.pageSize]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, LotDto)) {
      const data = [newData, ...FGRecevingState.data];
      if (data.length > FGRecevingState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setFGRecevingState({
          ...FGRecevingState,
          data: [...data],
          totalRow: FGRecevingState.totalRow + 1,
        });
    }
  }, [newData]);

  const columns = [
    { field: 'Id', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.Id) + 1 + (FGRecevingState.page - 1) * FGRecevingState.pageSize,
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
          <Grid container direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
                disabled={params.row.BinId ? true : false}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: 'MaterialColorCode',
      headerName: 'Material Code',
      width: 250,
    },

    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 250,
    },

    {
      field: 'Qty',
      headerName: 'Qty',
      width: 100,
    },
    {
      field: 'QCDate',
      headerName: 'QC Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'IncomingDate',
      headerName: 'Incoming Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];
  const handleDelete = async (lot) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await fgReceivingService.handleDelete(lot);

        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item xs={4}></Grid>
        <Grid item xs={8}>
          <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs={9.5}>
              <MuiTextField
                ref={lotInputRef}
                label="Lot"
                // autoFocus={focus}
                // value={lotInputRef.current.value}
                onChange={handleLotInputChange}
                onKeyDown={keyPress}
              />
            </Grid>
            <Grid item xs={2.5}>
              <MuiButton text="scan" color="success" onClick={scanBtnClick} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={FGRecevingState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={columns}
        rows={FGRecevingState.data}
        page={FGRecevingState.page - 1}
        pageSize={FGRecevingState.pageSize}
        rowCount={FGRecevingState.totalRow}
        rowsPerPageOptions={[5, 10, 15, 20]}
        onPageChange={(newPage) => {
          setFGRecevingState({ ...FGRecevingState, page: newPage + 1 });
        }}
        onPageSizeChange={(newPageSize) => {
          setFGRecevingState({
            ...FGRecevingState,
            page: 1,
            pageSize: newPageSize,
          });
        }}
        getRowId={(rows) => rows.Id}
        // onSelectionModelChange={(newSelectedRowId) =>
        //     handleRowSelection(newSelectedRowId)
        // }
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
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

export default connect(mapStateToProps, mapDispatchToProps)(FGReceiving);
