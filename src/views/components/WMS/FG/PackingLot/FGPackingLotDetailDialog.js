import { MuiButton, MuiDialog, MuiTextField } from '@controls';
import { Box, Grid } from '@mui/material';
import { fgPackingService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';

const FGPackingLotDetailDialog = ({ isOpen, onClose, setNewData, setUpdateData, PackingLabelId, handleUpdateQty }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const lotInputRef = useRef(null);

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim();
      setDialogState({ ...dialogState, isSubmit: true });

      const res = await fgPackingService.createPADetail({ LotIdScan: inputVal, PackingLabelId: PackingLabelId });
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData(res.Data);
        handleUpdateQty(res.Data.Qty);
        setDialogState({ ...dialogState, isSubmit: false });
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }

      lotInputRef.current.value = '';
    }
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.create' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={onClose}
    >
      <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Box className="d-flex align-items-center my-3">
            <MuiTextField
              ref={lotInputRef}
              label="lot"
              onChange={(e) => (lotInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
            />
            <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ ml: 2, whiteSpace: 'nowrap' }} />
          </Box>
        </Grid>
      </Grid>
    </MuiDialog>
  );
};

export default FGPackingLotDetailDialog;
