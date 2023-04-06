import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiTextField } from '@controls';
import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { MuiButton } from '@controls';
import { ErrorAlert } from '@utils';
import axios from 'axios';

const testString = `CT~~CD,~CC^~CT~
^XA
~TA000
~JSN
^LT0
^MNW
^MTT
^PON
^PMN
^LH0,0
^JMA
^PR7,7
~SD25
^JUS
^LRN
^CI27
^PA0,1,1,0
^XZ
^XA
^MMT
^PW591
^LL150
^LS0
^BY4,3,41^FT116,56^BCN,,Y,N
^FH\^FD>;BN63-18827A-0001^FS
^PQ1,0,1,Y
^XZ
^XZ
^XA
^MMT
^PW591
^LL150
^LS0
^BY4,3,41^FT116,56^BCN,,Y,N
^FH\^FD>;BN63-18827A-0002^FS
^PQ1,0,1,Y
^XZ
^XZ
^XA
^MMT
^PW591
^LL150
^LS0
^BY4,3,41^FT116,56^BCN,,Y,N
^FH\^FD>;BN63-18827A-0003^FS
^PQ1,0,1,Y
^XZ
`;
const ChooseDevicePrintDialog = (props) => {
  const intl = useIntl();
  const [deviceList, setDeviceList] = useState([]);
  const [printer, setPrinter] = useState(null);
  const { isOpen, onClose, dataPrint } = props;

  const [dialogState, setDialogState] = useState({
    isSubmit: false,
    from: 1,
    to: 1,
  });

  const setupPrinter = () => {
    window.BrowserPrint.getLocalDevices(
      (device_list) => {
        for (let i = 0; i < device_list.length; i++) {
          let device = device_list[i];
          deviceList.push(device);
        }
      },
      () => {
        ErrorAlert(intl.formatMessage({ id: 'general.cannot_connect_printer' }));
      },
      'printer'
    );
  };

  useEffect(() => {
    isOpen && setupPrinter();
  }, [isOpen]);

  const handleCloseDialog = () => {
    setDialogState({
      isSubmit: false,
      from: 1,
      to: 1,
    });
    onClose();
  };

  const errorPrintCallback = (errorMessage) => {
    alert('Error: ' + errorMessage);
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    setDialogState((state) => ({ ...state, [name]: value }));
  };
  const handlePrint = () => {
    if (!printer) {
      ErrorAlert(intl.formatMessage({ id: 'general.not_select_printer' }));
      return;
    }
    if (!dialogState.from || !dialogState.to || Number(dialogState.from) < 1 || Number(dialogState.to) < 1) {
      ErrorAlert(intl.formatMessage({ id: 'general.field_min' }, { min: 1 }));
      return;
    }
    if (Number(dialogState.to) > dataPrint.OrderQty) {
      ErrorAlert(intl.formatMessage({ id: 'work_order.No_More_Than_QTY' }));
      return;
    }
    if (Number(dialogState.from) > Number(dialogState.to)) {
      ErrorAlert(intl.formatMessage({ id: 'general.field_invalid' }));
      return;
    }

    let stringPrint = `CT~~CD,~CC^~CT~
    ^XA
    ~TA000
    ~JSN
    ^LT0
    ^MNW
    ^MTT
    ^PON
    ^PMN
    ^LH0,0
    ^JMA
    ^PR7,7
    ~SD25
    ^JUS
    ^LRN
    ^CI27
    ^PA0,1,1,0`;
    for (let i = Number(dialogState.from); i <= Number(dialogState.to); i++) {
      let outputString = `${dataPrint.MaterialCode}-` + i.toString().padStart(5, '0');
      stringPrint += `^XZ
      ^XA
      ^MMT
      ^PW591
      ^LL150
      ^LS0
      ^BY2,3,45^FT68,66^BCN,,Y,N
      ^A0N,30,30^FH^FD>:${outputString}^FS
      ^PQ1,0,1,Y
      ^XZ`;
    }
    // ^FH\^FD>:${outputString}^FS
    printer.send(stringPrint, undefined, errorPrintCallback);
  };
  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.print' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <MuiTextField
              label={'From'}
              type="number"
              name="from"
              min={1}
              value={dialogState.from ?? ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <MuiTextField
              label={'To'}
              type="number"
              name="to"
              min={1}
              value={dialogState.to ?? ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={deviceList}
              getOptionLabel={(device) => `${device?.name} `}
              onChange={(e, value) => setPrinter(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: 'general.choose_printer' })}
                  name="device"
                  variant="outlined"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiButton text="print" color="primary" onClick={handlePrint} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default ChooseDevicePrintDialog;
