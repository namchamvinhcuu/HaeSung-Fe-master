import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import { ErrorAlert, SuccessAlert } from '@utils';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField, MuiTextField } from '@controls';
import { Grid, Typography, Tooltip, Button } from '@mui/material';
import { eslService, wmsLayoutService, materialPutAwayService } from '@services';
import _ from 'lodash';
import moment from 'moment';
import { useModal } from '@basesShared';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import LinkIcon from '@mui/icons-material/Link';

const MappingBin = (props) => {
  let isRendered = useRef(true);
  const binInputRef = useRef(null);
  const eslInputRef = useRef(null);
  const intl = useIntl();
  const [BinCode, setBinCode] = useState('');
  const [BinId, setBinId] = useState(0);
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
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (putAwayState.page - 1) * putAwayState.pageSize,
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
      field: 'LocationCode',
      headerName: 'Bin',
      width: 250,
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

  useEffect(() => {
    fetchData();
    return () => (isRendered = false);
  }, [state.page, state.pageSize]);

  const fetchData = async () => {
    setState({ ...state, isLoading: true });

    const res = await wmsLayoutService.getBinsMapping({
      page: state.page,
      pageSize: state.pageSize,
    });

    if (res && res.Data) {
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (BinCode === '') {
      if (binInputRef.current.value) {
        inputVal = binInputRef.current.value.trim().toUpperCase();
      }

      const Bin = await wmsLayoutService.getBinByCode({ BinCode: inputVal });
      if (Bin.HttpResponseCode && Bin.Data) {
        setBinCode(inputVal);
        setBinId(Bin.Data.BinId);
        eslInputRef.current?.focus();
      } else {
        ErrorAlert(intl.formatMessage({ id: Bin.ResponseMessage }));
        binInputRef.current.value = '';
      }
    } else {
      if (eslInputRef.current.value) {
        inputVal = eslInputRef.current.value.trim().toUpperCase();
      }
      await handleScanESLCode(inputVal);
    }
  };

  const handleScanESLCode = async (inputValue) => {
    if (!inputValue || inputValue.length !== 12) {
      ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
      eslInputRef.current.value = '';
    } else {
      const getRegisteredESLTag = await eslService.getRegisteredESLTagByCode(inputValue);

      if (getRegisteredESLTag.status !== 200) {
        ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
        eslInputRef.current.value = '';
      }
      setState({ ...state, isLoading: true });
      // Create/Update ESL
      const createResponse = await eslService.createBinOnESLServer(BinCode, 'Bin-1');

      if (createResponse.status === 200) {
        // Link ESL-Bin
        const linkResponse = await eslService.linkESLTagWithBin(BinCode, inputValue);

        if (linkResponse.status === 200) {
          // Update ESL Data
          await eslService.updateESLDataByBinId(BinId);

          await wmsLayoutService.unLinkESL({ ESLCode: inputValue });

          const res = await wmsLayoutService.scanESLCode({ ESLCode: inputValue, BinId: BinId });

          if (res === 'general.success') {
            fetchData();
            SuccessAlert(intl.formatMessage({ id: res }));
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        }
      }
      setState({ ...state, isLoading: false });
    }
  };

  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={7}>
          <Grid item sx={{ mb: 1, textAlign: 'right', display: 'flex', alignItems: 'center' }}>
            <MuiTextField
              autoFocus
              sx={{ width: 300 }}
              ref={binInputRef}
              label={intl.formatMessage({ id: 'MappingBin.BinCode' })}
              onChange={(e) => (binInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
              //inputProps={{ maxLength: 12 }}
            />
            <LinkIcon sx={{ mr: 1, ml: 1 }} />
            <MuiTextField
              sx={{ width: 300, mr: 1 }}
              ref={eslInputRef}
              label={intl.formatMessage({ id: 'MappingBin.ESLCode' })}
              onChange={(e) => (eslInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
              //inputProps={{ maxLength: 12 }}
            />
            <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap', mr: 1 }} />
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setBinCode('');
                setBinId(0);
                binInputRef.current?.focus();
                binInputRef.current.value = '';
                eslInputRef.current.value = '';
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

export default connect(mapStateToProps, mapDispatchToProps)(MappingBin);
