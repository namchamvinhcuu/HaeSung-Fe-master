import { MuiButton, MuiDialog, MuiTextField } from '@controls';
import { usePrintBIXOLON } from '@hooks';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { workOrderService } from '@services';
import { ErrorAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const ChooseDevicePrintDialog = (props) => {
  const intl = useIntl();
  const [deviceList, setDeviceList] = useState([]);
  const [printer, setPrinter] = useState(null);
  const { isOpen, onClose, dataPrint } = props;
  const { printBIXILON } = usePrintBIXOLON();
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
    from: 1,
    to: 1,
  });

  const setupPrinter = () => {
    window.BrowserPrint.getLocalDevices(
      (device_list) => {
        const data = [];
        for (let i = 0; i < device_list.length; i++) {
          let device = device_list[i];
          data.push(device);
        }
        setDeviceList(data);
      },
      () => {
        ErrorAlert(intl.formatMessage({ id: 'general.cannot_connect_printer' }));
        setDeviceList([]);
      },
      'printer'
    );
  };

  const fetchData = async () => {
    const data = await workOrderService.getInfoMaterialForPrint({
      BomCode: dataPrint.MaterialCode,
      Version: dataPrint.BomVersion,
      WOProcess: dataPrint.WOProcess,
    });
    setDialogState((prev) => ({
      ...prev,
      [dataPrint.WOProcess ? 'materials' : 'title']: dataPrint.WOProcess ? data : data.title,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setupPrinter();
      fetchData();
    }
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
  const handlePrint = async () => {
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

    // if (dataPrint.WOProcess && !dialogState.MaterialCode) {
    //   ErrorAlert('Please Select Spacer');
    //   return;
    // }

    let datePrint = moment().format(dataPrint.WOProcess ? 'YYYY.MM.DD' : 'YYYYMMDD');
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
    ~SD20
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
      ^LL94
      ^LS0
      ${
        dataPrint.WOProcess
          ? `^FT484,99^BQN,2,3
      ^FH\^FDLA,${outputString}^FS
      ^FT34,45^A0N,25,20^FH\^CI28^FD${outputString}^FS^CI27
      ^FT34,80^A0N,17,18^FH\^CI28^FDSPACER ${dialogState.MaterialCode}  ${dialogState.Amount}${dialogState.Unit}^FS^CI27
      ^FT348,80^A0N,17,18^FH\^CI28^FDEB1I^FS^CI27
      ^FT348,47^A0N,17,18^FH\^CI28^FD${datePrint}^FS^CI27`
          : `^FT14,88^BQN,2,3
      ^FH\^FDLA,${outputString}^FS
      ^FT515,88^BQN,2,3
      ^FH\^FDLA,${outputString}^FS
      ^FT84,56^A0N,17,18^FH\^CI28^FD${outputString}^FS^CI27
      ^FT84,79^A0N,17,18^FH\^CI28^FD${datePrint}^FS^CI27
      ^FT84,33^A0N,17,15^FH\^CI28^FD${dialogState.title}^FS^CI27
      ^FT177,79^A0N,17,18^FH\^CI28^FDEB1I^FS^CI27
      `
      }
      ^PQ1,0,1,Y
      ^XZ`;
    }
    // ^FH\^FD>:${outputString}^FS
    printer.send(stringPrint, undefined, errorPrintCallback);
  };

  const handlePrintBIXOLON = () => {
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
    let data = [];
    for (let i = Number(dialogState.from); i <= Number(dialogState.to); i++) {
      let outputString = `${dataPrint.MaterialCode}-` + i.toString().padStart(5, '0');
      data.push({ MaterialCode: outputString });
    }

    printBIXILON(data);
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
          {dataPrint?.WOProcess && (
            <Grid item xs={12}>
              <Autocomplete
                options={dialogState.materials ?? []}
                getOptionLabel={(data) => `SPACER ${data.MaterialCode}  ${data.Amount}${data.Unit}`}
                onChange={(e, value) => setDialogState((prev) => ({ ...prev, ...value }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label={`Choose SPACER`}
                    name="materials"
                    variant="outlined"
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiButton text="print_zebra" color="primary" onClick={handlePrint} />
              <MuiButton text="print_bixolon" color="success" onClick={handlePrintBIXOLON} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default ChooseDevicePrintDialog;
