import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import LinkOffIcon from '@mui/icons-material/LinkOff';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import { ErrorAlert, SuccessAlert } from '@utils';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField, MuiTextField } from '@controls';
import { Grid, Typography, Tooltip, Button } from '@mui/material';
import { eslService, wmsLayoutService, materialPutAwayService, mappingTrayService } from '@services';
import _ from 'lodash';
import moment from 'moment';
import { useModal } from '@basesShared';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import LinkIcon from '@mui/icons-material/Link';

const MappingTray = (props) => {
  let isRendered = useRef(true);
  const trayInputRef = useRef(null);
  const lotInputRef = useRef(null);
  const intl = useIntl();
  const [TrayCode, setTrayCode] = useState('');
  const [newData, setNewData] = useState({});
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
  });

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
                onClick={() => unMapping(params.row)}
              >
                <LinkOffIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: 'MaterialColorCode',
      headerName: 'Material Code',
      flex: 0.5,
    },
    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      flex: 0.5,
    },
    {
      field: 'Qty',
      headerName: 'Qty',
      flex: 0.5,
    },
    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      flex: 0.5,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.createdDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];

  useEffect(() => {
    if (TrayCode != '') fetchData();
    return () => (isRendered = false);
  }, [state.page, state.pageSize]);

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state,
        data: [...data],
        totalRow: state.totalRow + 1,
      });
    }
  }, [newData]);

  const fetchData = async () => {
    setState({ ...state, isLoading: true });

    const res = await mappingTrayService.get({
      page: state.page,
      pageSize: state.pageSize,
      trayCode: TrayCode,
    });

    if (res) {
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  };

  const unMapping = async (item) => {
    if (window.confirm(intl.formatMessage({ id: 'tray.confirm_unMapping' }))) {
      try {
        let res = await mappingTrayService.unMapping(item);
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
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
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (TrayCode === '') {
      if (trayInputRef.current.value) {
        setState({ ...state, isLoading: true });
        inputVal = trayInputRef.current.value.trim().toUpperCase();

        const res = await mappingTrayService.get({
          page: 1,
          pageSize: state.pageSize,
          trayCode: inputVal,
        });

        if (res && res.HttpResponseCode == 200) {
          setTrayCode(inputVal);
          setState({
            ...state,
            data: res.Data ?? [],
            totalRow: res.TotalRow,
            isLoading: false,
          });
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          lotInputRef.current?.focus();
          trayInputRef.current.disable = true;
        } else {
          setState({
            ...state,
            data: [],
            totalRow: 0,
            isLoading: false,
          });
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));

          trayInputRef.current.value = '';
        }
      }
    } else {
      if (lotInputRef.current.value) {
        inputVal = lotInputRef.current.value.trim().toUpperCase();
      }
      await handleScanMapping(inputVal);
    }
  };

  const handleScanMapping = async (inputValue) => {
    const res = await mappingTrayService.scanMapping({
      LotId: inputValue,
      TrayCode: TrayCode,
    });

    if (res.HttpResponseCode === 200) {
      setNewData(res.Data);
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
    lotInputRef.current.value = '';
  };

  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={7}>
          <Grid item sx={{ mb: 1, textAlign: 'right', display: 'flex', alignItems: 'center' }}>
            <MuiTextField
              autoFocus
              sx={{ width: 300 }}
              ref={trayInputRef}
              label={intl.formatMessage({ id: 'tray.TrayCode' })}
              onChange={(e) => {
                if (TrayCode != '') setTrayCode('');
                trayInputRef.current.value = e.target.value;
              }}
              onKeyDown={keyPress}
            />
            <LinkIcon sx={{ mr: 1, ml: 1 }} />
            <MuiTextField
              sx={{ width: 300, mr: 1 }}
              ref={lotInputRef}
              label={'Lot'}
              onChange={(e) => (lotInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
            />
            <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap', mr: 1 }} />
            <Button
              variant="outlined"
              color="error"
              disabled={TrayCode != '' ? false : true}
              onClick={() => {
                setTrayCode('');
                trayInputRef.current?.focus();
                trayInputRef.current.value = '';
                lotInputRef.current.value = '';
                setState({ ...state, data: [], totalRow: 0 });
              }}
            >
              CLEAR
            </Button>
          </Grid>
        </Grid>
        <Grid item></Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        gridHeight={736}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.Id}
        //onSelectionModelChange={(newSelectedRowId) => setWoId(newSelectedRowId[0])}
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

export default connect(mapStateToProps, mapDispatchToProps)(MappingTray);
