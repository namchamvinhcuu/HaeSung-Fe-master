import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiButton, MuiDataGrid, MuiTextField } from '@controls';
import { LotDto } from '@models';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { wipReceivingService } from '@services';
import { ErrorAlert, SuccessAlert, isNumber } from '@utils';
import moment from 'moment';
import { useIntl } from 'react-intl';

const WIPReceiving = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const lotInputRef = useRef(null);
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
  });

  const [focus, setFocus] = useState(true);
  const [newData, setNewData] = useState({ ...LotDto });

  const columns = [
    { field: 'Id', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    {
      field: 'action',
      headerName: '',
      width: 80,
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
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    { field: 'MaterialColorCode', headerName: 'Material Code', flex: 0.4 },
    { field: 'Qty', headerName: 'Qty', flex: 0.3 },
    {
      field: 'QCDate',
      headerName: 'QC Date',
      flex: 0.5,
      valueFormatter: (params) => {
        if (params.value !== null) return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      field: 'QCResult',
      headerName: 'QC Result',
      flex: 0.5,
      valueFormatter: (params) => (params?.value ? 'OK' : 'NG'),
    },
    {
      field: 'IncomingDate',
      headerName: 'Incoming Date',
      flex: 0.5,
      valueFormatter: (params) => {
        if (params.value !== null) return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, LotDto)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      if (isRendered)
        setState({
          ...state,
          data: [...data],
          totalRow: state.totalRow + 1,
        });
    }
  }, [newData]);

  const fetchData = async () => {
    setState({ ...state, isLoading: true });

    const res = await wipReceivingService.get({ page: state.page, pageSize: state.pageSize });

    if (res && isRendered)
      setState({
        ...state,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  const handleDelete = async (lot) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await wipReceivingService.handleDelete(lot);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await handleReceivingLot(e.target.value);
      lotInputRef.current.value = '';
      setFocus(true);
    }
  };

  const scanBtnClick = async () => {
    await handleReceivingLot(lotInputRef.current.value);
    // setLotInput('');
    lotInputRef.current.value = '';
    setFocus(true);
  };

  const handleReceivingLot = async (inputValue) => {
    const res = await wipReceivingService.receivingLot({ Id: inputValue });
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

  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item xs={4}></Grid>
        <Grid item xs={8}>
          <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs={6}></Grid>
            <Grid item sx={{ width: '400px', marginBottom: '15px' }}>
              <MuiTextField
                ref={lotInputRef}
                label={'Lot'}
                autoFocus={focus}
                onChange={(e) => (lotInputRef.current.value = e.target.value)}
                onKeyDown={keyPress}
              />
            </Grid>
            <Grid>
              <MuiButton text="scan" color="success" sx={{ m: 0 }} onClick={scanBtnClick} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setState({ ...state, page: 1, pageSize: newPageSize })}
        getRowId={(rows) => rows.Id}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
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

export default connect(mapStateToProps, mapDispatchToProps)(WIPReceiving);
