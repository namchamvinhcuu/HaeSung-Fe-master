import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MuiAutocomplete,
  MuiButton,
  MuiDataGrid,
  MuiDialog,
  MuiResetButton,
  MuiSelectField,
  MuiSubmitButton,
  MuiTextField,
} from '@controls';
import { Grid, Typography } from '@mui/material';
import moment from 'moment';
import { ErrorAlert, SuccessAlert, dateToTicks } from '@utils';
import { actualService } from '@services';
import { useIntl } from 'react-intl';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

const ActualScanBarcode = ({ woId, materialId, materialCode, openScan, onClose, refreshLotDataGrid, getWoInfo }) => {
  const intl = useIntl();

  const initState = {
    isLoading: false,
    dataDemo: [],
    totalRow: 0,
    page: 1,
    pageSize: 50,
    WoId: woId,
  };

  const [state, setState] = useState(initState);
  const [count, setCount] = useState(0);

  const barCodeRef = useRef(null);

  const handleBarcodeChange = (e) => {
    barCodeRef.current.value = e.target.value;
  };

  const keyPressBarcodeScan = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const closeScanBarcodeDialog = () => {
    setState(initState);
    setCount(0);
    onClose();
  };

  const handleSaveBarcodeScan = async () => {
    if (state.dataDemo && state.dataDemo.length) {
      const postData = {
        WoId: woId,
        Qty: state.dataDemo.length,
        LotNumber: 1,
        LotSerial: '',
        QCResult: 'OK',
        QCId: [],
        BarcodeScan: state.dataDemo,
      };

      let { HttpResponseCode, ResponseMessage } = await actualService.createByWo(postData);

      if (HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: ResponseMessage }));
        refreshLotDataGrid(woId);
        getWoInfo(woId, true);

        closeScanBarcodeDialog();
      } else {
        if (ResponseMessage && ResponseMessage.includes('lot.QtyStockNotEnough')) {
          let convertMsg = ResponseMessage.split('-');
          const msg = convertMsg.slice(0, 1).join('-');
          const material = convertMsg.slice(1).join('-');
          ErrorAlert(intl.formatMessage({ id: msg }) + ': ' + material);
        } else ErrorAlert(intl.formatMessage({ id: ResponseMessage }));
      }
    } else {
      ErrorAlert('No data');
    }
  };

  const scanBtnClick = async () => {
    if (!barCodeRef.current.value) {
      ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
    } else {
      const inputString = barCodeRef.current.value;
      const check = state.dataDemo.find((item) => item.Barcode == inputString);
      if (check) {
        ErrorAlert(intl.formatMessage({ id: 'general.duplicated_code' }));
      } else {
        const lastDashIndex = inputString.lastIndexOf('-');
        const materialCodeFromBarcode = inputString.substring(0, lastDashIndex);

        const newRow = {
          Id: dateToTicks(new Date()),
          WoId: woId,
          MaterialId: materialId,
          MaterialCode: materialCode,
          MaterialCodeFromBarcode: materialCodeFromBarcode,
          Barcode: barCodeRef.current.value,
          createdDate: new Date(),
        };

        const res = await actualService.handleCheckBarcodeScan(newRow);

        if (res === 'general.success') {
          setState({ ...state, dataDemo: [newRow, ...state.dataDemo] });
          setCount(count + 1);
          SuccessAlert(intl.formatMessage({ id: res }));
        } else {
          ErrorAlert(intl.formatMessage({ id: res }));
        }
      }

      barCodeRef.current.value = '';
      barCodeRef.current.focus();
    }
  };
  const deleteItem = (Id) => {
    console.log(Id);
    setState((prev) => ({ ...prev, dataDemo: prev.dataDemo.filter((x) => x.Id != Id) }));
  };

  const demoColumns = [
    {
      field: 'id',
      headerName: '',
      width: 100,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'Id', headerName: 'Id', width: 200, hide: true },
    {
      field: 'Barcode',
      headerName: 'Data',
      width: 300,
    },
    { field: 'MaterialCode', headerName: 'Code', width: 200 },
    {
      field: 'createdDate',
      headerName: 'Time',
      width: 200,
      valueFormatter: (params) => {
        // console.log('🚀 ~ file: ActualScanBarcode.js:106 ~ ActualScanBarcode ~ params:', params);
        return params?.value ? moment(params?.value).format('YYYY-MM-DD HH:mm:ss') : null;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Delete',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          color="warning"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => deleteItem(params.row.Id)}
        />,
      ],
    },
  ];

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="lg"
        // title={intl.formatMessage({ id: 'general.scan' })}
        title="Scan"
        isOpen={openScan}
        disabledCloseBtn={state.isLoading}
        disable_animate={300}
        onClose={closeScanBarcodeDialog}
      >
        <Grid
          container
          rowSpacing={2.5}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          alignItems="flex-end"
          style={{ paddingTop: '5px' }}
        >
          <Grid item container spacing={2} xs={12}>
            <Grid item xs={5}>
              <MuiTextField
                ref={barCodeRef}
                label="Barcode"
                disabled={state.isLoading}
                autoFocus
                // value={barCodeRef.current.value}
                onChange={handleBarcodeChange}
                onKeyDown={keyPressBarcodeScan}
              />
            </Grid>
            <Grid item xs={7}>
              <MuiButton text="scan" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
              <MuiButton
                text="save"
                color="success"
                onClick={handleSaveBarcodeScan}
                sx={{ whiteSpace: 'nowrap', marginRight: '10px' }}
              />
              <Typography sx={{ display: 'inline-block', marginLeft: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                Count: {count}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <MuiDataGrid
                showLoading={state.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={demoColumns}
                rows={state.dataDemo}
                gridHeight={500}
                page={state.page - 1}
                pageSize={state.dataDemo.length}
                rowCount={state.totalRow}
                getRowId={(rows) => rows.Id}
                hideFooter
              />
            </Grid>
          </Grid>
        </Grid>
      </MuiDialog>
    </React.Fragment>
  );
};

export default ActualScanBarcode;
