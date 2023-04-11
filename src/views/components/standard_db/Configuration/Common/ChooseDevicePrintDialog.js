import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls';
import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { MuiButton } from '@controls';
import { ErrorAlert } from '@utils';
import axios from 'axios';
// const testString = `
// CT~~CD,~CC^~CT~
// ^XA
// ~TA000
// ~JSN
// ^LT0
// ^MNW
// ^MTT
// ^PON
// ^PMN
// ^LH0,0
// ^JMA
// ^PR6,6
// ~SD15
// ^JUS
// ^LRN
// ^CI27
// ^PA0,1,1,0
// ^XZ
// ^XA
// ^MMT
// ^PW1181
// ^LL827
// ^LS0
// ^FT35,103^A0N,33,33^FH\^CI28^FDPart No^FS^CI27
// ^FT976,103^A0N,33,33^FH\^CI28^FDSoluM Vina^FS^CI27
// ^FT35,211^A0N,33,33^FH\^CI28^FDPart name^FS^CI27
// ^FT35,310^A0N,33,33^FH\^CI28^FDQ'ty^FS^CI27
// ^FT215,310^A0N,33,33^FH\^CI28^FD2000^FS^CI27
// ^FT215,211^A0N,33,33^FH\^CI28^FDA/D Converter IC;12P,PLASTIC,5.61x9.0MM^FS^CI27
// ^FT215,252^A0N,33,33^FH\^CI28^FDMINSOP^FS^CI27
// ^FT887,211^A0N,33,33^FH\^CI28^FDPLANT^FS^CI27
// ^FT1046,211^A0N,33,33^FH\^CI28^FDP000^FS^CI27
// ^FT35,410^A0N,33,33^FH\^CI28^FDLot Code^FS^CI27
// ^FT215,410^A0N,33,33^FH\^CI28^FD1002A0200051_230310_ABC_XXXX^FS^CI27
// ^FT887,410^A0N,33,33^FH\^CI28^FDMSL3^FS^CI27
// ^FT30,498^A0N,33,35^FH\^CI28^FDReceived Date^FS^CI27
// ^FT350,498^A0N,33,35^FH\^CI28^FD2023-03-01^FS^CI27
// ^FT35,583^A0N,33,35^FH\^CI28^FDVENDOR^FS^CI27
// ^FT237,586^A0N,36,38^FH\^CI28^FDPower Integrations InterNation Ltd^FS^CI27
// ^FT35,663^A0N,33,35^FH\^CI28^FDMFG Date^FS^CI27
// ^FT237,663^A0N,33,35^FH\^CI28^FD2023-03-15^FS^CI27
// ^FT35,753^A0N,33,35^FH\^CI28^FDOriginal^FS^CI27
// ^FT237,753^A0N,33,35^FH\^CI28^FDThaiLand^FS^CI27
// ^BY4,3,59^FT215,124^BCN,,Y,Y
// ^FH\^FD>;123456789012^FS
// ^FT852,768^BQN,2,10
// ^FH\^FDLA,1002A0200051_230310_ABC_XXXX^FS
// ^PQ1,0,1,Y
// ^XZ
// ^XZ
// ^XA
// ^MMT
// ^PW1181
// ^LL827
// ^LS0
// ^FT35,103^A0N,33,33^FH\^CI28^FDPart No^FS^CI27
// ^FT976,103^A0N,33,33^FH\^CI28^FDSoluM Vina^FS^CI27
// ^FT35,211^A0N,33,33^FH\^CI28^FDPart name^FS^CI27
// ^FT35,310^A0N,33,33^FH\^CI28^FDQ'ty^FS^CI27
// ^FT215,310^A0N,33,33^FH\^CI28^FD2000^FS^CI27
// ^FT215,211^A0N,33,33^FH\^CI28^FDA/D Converter IC;12P,PLASTIC,5.61x9.0MM^FS^CI27
// ^FT215,252^A0N,33,33^FH\^CI28^FDMINSOP^FS^CI27
// ^FT887,211^A0N,33,33^FH\^CI28^FDPLANT^FS^CI27
// ^FT1046,211^A0N,33,33^FH\^CI28^FDP000^FS^CI27
// ^FT35,410^A0N,33,33^FH\^CI28^FDLot Code^FS^CI27
// ^FT215,410^A0N,33,33^FH\^CI28^FD1002A0200051_230310_ABC_XXXX^FS^CI27
// ^FT887,410^A0N,33,33^FH\^CI28^FDMSL3^FS^CI27
// ^FT30,498^A0N,33,35^FH\^CI28^FDReceived Date^FS^CI27
// ^FT350,498^A0N,33,35^FH\^CI28^FD2023-03-01^FS^CI27
// ^FT35,583^A0N,33,35^FH\^CI28^FDVENDOR^FS^CI27
// ^FT237,586^A0N,36,38^FH\^CI28^FDPower Integrations InterNation Ltd^FS^CI27
// ^FT35,663^A0N,33,35^FH\^CI28^FDMFG Date^FS^CI27
// ^FT237,663^A0N,33,35^FH\^CI28^FD2023-03-15^FS^CI27
// ^FT35,753^A0N,33,35^FH\^CI28^FDOriginal^FS^CI27
// ^FT237,753^A0N,33,35^FH\^CI28^FDThaiLand^FS^CI27
// ^BY4,3,59^FT215,124^BCN,,Y,Y
// ^FH\^FD>;123456789013^FS
// ^FT852,768^BQN,2,10
// ^FH\^FDLA,1002A0200051_230310_ABC_XXXX^FS
// ^PQ1,0,1,Y
// ^XZ
// `;
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
^FH\^FD>;0832127407^FS
^PQ1,0,1,Y
^XZ


`;
const ChooseDevicePrintDialog = (props) => {
  const intl = useIntl();
  const [deviceList, setDeviceList] = useState([]);
  const [printer, setPrinter] = useState(null);
  const { isOpen, onClose } = props;

  const [dialogState, setDialogState] = useState({
    isSubmit: false,
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

  useEffect(() => {
    isOpen && setupPrinter();
  }, [isOpen]);

  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    onClose();
  };

  const writeToSelectedPrinter = (dataToPrint) => {
    if (printer) printer.send(dataToPrint, undefined, errorPrintCallback);
    else ErrorAlert(intl.formatMessage({ id: 'general.not_select_printer' }));
  };

  const errorPrintCallback = (errorMessage) => {
    alert('Error: ' + errorMessage);
  };
  // const writeToSelectedPrinter = async (dataToPrint) => {
  //   const result = await axios.post('http://192.168.5.10:9100/write', dataToPrint);
  //   console.log('result print', result.data);
  // };
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
          <Grid item xs={12}>
            <Autocomplete
              options={deviceList}
              getOptionLabel={(device) => `${device?.name} `}
              onChange={(e, value) => setPrinter(value)}
              //onOpen={handleBlur}
              //includeInputInList
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: 'general.choose_printer' })}
                  name="device"
                  variant="outlined"
                  //error={Boolean(touched.commonDetailId && errors.commonDetailId)}
                  // helperText={touched.commonDetailId && errors.commonDetailId}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiButton
                text="print"
                color="primary"
                onClick={() => {
                  writeToSelectedPrinter(testString);
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default ChooseDevicePrintDialog;
