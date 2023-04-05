import React, { useState, useEffect, useRef } from 'react';
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
import { Grid } from '@mui/material';

const ActualScanBarcode = ({ woId, openScan, onClose }) => {
  const [state, setState] = useState({
    isLoading: false,
    dataDemo: [],
    totalRow: 0,
    page: 1,
    pageSize: 50,
    WoId: woId,
  });

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
    // resetForm();
    // setRowSelected([]);
    // setListData([]);
    onClose();
  };

  const scanBtnClick = async () => {};

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
            <Grid item xs={4}>
              <MuiTextField
                ref={barCodeRef}
                label="Barcode"
                disabled={state.isLoading}
                // autoFocus={focus}
                // value={barCodeRef.current.value}
                onChange={handleBarcodeChange}
                onKeyDown={keyPressBarcodeScan}
              />
            </Grid>
            <Grid item>
              <MuiButton text="scan" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
            </Grid>
          </Grid>
        </Grid>
      </MuiDialog>
    </React.Fragment>
  );
};

export default ActualScanBarcode;
